import logging
import requests as http_requests
from django.http import Http404
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from . import util
from common import utils
from brewery.models import Playlist
from brewery.serializers import PlaylistSerializer, TrackSerializer
from .tasks import check_task_status

logger = logging.getLogger(__name__)


@api_view(["GET"])
def get_brew_status(request, task_id):
    if not task_id:
        return Response(
            {"message": "Task ID not provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    task = check_task_status(task_id)
    task_status = task.get("status")
    if task_status == "FAILURE":
        return Response(
            {"status": "FAILURE", "message": "Error downloading music"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    if task_status == "SUCCESS":
        return Response(
            {"status": "SUCCESS", "path": task.get("result")},
            status=status.HTTP_200_OK,
        )
    return Response({"status": "PENDING"}, status=status.HTTP_200_OK)


ALLOWED_FILE_FORMATS = {"m4a", "mp3", "wav", "opus", "flac"}


@api_view(["POST"])
def brew(request):
    data = request.data
    link = data.get("link")
    file_format = data.get("fileFormat", "m4a")
    if (
        not data
        or not link
        or not file_format
        or file_format not in ALLOWED_FILE_FORMATS
    ):
        return Response(
            {"message": "Link not provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    # Download music
    if task_id := util.brew(link=link, file_format=file_format):
        # Log the download
        if request.user.is_authenticated and (music_data := utils.get_data(link)):
            # Determine if playlist
            playlist = None
            exists = 0
            if playlist_data := music_data.get("playlist_data"):
                playlist_data["watcher"] = request.user.id
                try:
                    # Update playlist
                    playlist = Playlist.objects.get(
                        watcher=request.user,
                        playlist_id=playlist_data.get("playlist_id"),
                    )
                    serializer = PlaylistSerializer(playlist, data=playlist_data)
                    exists = 1
                except Playlist.DoesNotExist:
                    # Create playlist
                    serializer = PlaylistSerializer(data=playlist_data)

                if serializer.is_valid():
                    playlist = serializer.save()
                    update_playlist_tracks(playlist, playlist_data["tracks"])

            return Response(
                {
                    "task_id": task_id,
                    "pk": playlist.pk if playlist else None,  # type: ignore
                    "exists": 1 if exists else 0,
                    "music_data": (
                        # Music data returned if logged in and link valid
                        music_data
                        if request.user.is_authenticated
                        and (
                            music_data.get("playlist_data")
                            or music_data.get("track_data")
                        )
                        else None
                    ),
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"task_id": task_id},
            status=status.HTTP_200_OK,
        )
    return Response(
        {"message": "Invalid link"},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
def download(request, path):
    return util.get_file(path)


class PlaylistList(APIView):
    """
    List all watched playlists, or begin watching a new playlist.
    """

    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    # List all watched playlists by user
    def get(self, request, *args, **kwargs):
        queryset = Playlist.objects.filter(watcher=self.request.user).order_by(
            "-last_modified"
        )
        return Response(
            PlaylistSerializer(queryset, many=True).data,
            status=status.HTTP_200_OK,
        )

    # Create new playlist and add to user watched list
    def post(self, request, *args, **kwargs):
        link = request.data.get("link")
        data = utils.get_data(link)
        if data.get("contentType") == utils.PLAYLIST:
            if playlist_data := data.get("playlist_data"):
                # Playlist is already saved
                if Playlist.objects.filter(
                    watcher=self.request.user,
                    playlist_id=playlist_data.get("playlist_id"),
                ):
                    return Response(playlist_data, status.HTTP_409_CONFLICT)
                playlist_serializer = PlaylistSerializer(
                    data={"watcher": self.request.user.pk, **playlist_data}
                )
                if playlist_serializer.is_valid():
                    playlist = playlist_serializer.save()
                else:
                    logger.warning(
                        "Playlist serializer errors: %s", playlist_serializer.errors
                    )
                    return Response(
                        playlist_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

                if track_data := playlist_data.get("tracks"):
                    for track in track_data:
                        track_serializer = TrackSerializer(
                            data={"playlist": playlist.pk, **track}  # type: ignore
                        )
                        if track_serializer.is_valid():
                            track_serializer.save()
                        else:
                            logger.warning(
                                "Track serializer errors: %s", track_serializer.errors
                            )
                            return Response(
                                track_serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                return Response(playlist_data, status=status.HTTP_201_CREATED)

        # Link is not a playlist
        return Response(status=status.HTTP_400_BAD_REQUEST)


class PlaylistDetail(APIView):
    """
    Retrieve, update, or delete a playlist instance.
    """

    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, playlist_id):
        try:
            return Playlist.objects.get(
                watcher=self.request.user, playlist_id=playlist_id
            )
        except Playlist.DoesNotExist:
            raise Http404

    def get(self, request, playlist_id):
        return Response(
            PlaylistSerializer(self.get_object(playlist_id)).data,
            status=status.HTTP_200_OK,
        )

    # Update playlist
    def put(self, request, playlist_id):
        playlist = self.get_object(playlist_id)
        # Retrieve new information from server and update playlist
        data = utils.get_data(playlist.link)
        playlist_data = data.get("playlist_data", {})

        new_tracks = update_playlist_tracks(playlist, playlist_data.get("tracks"))
        # If error response is returned
        if isinstance(new_tracks, Response):
            return new_tracks

        # Update playlist data
        playlist_serializer = PlaylistSerializer(
            playlist,
            data={"watcher": self.request.user.pk, **playlist_data},
        )
        if playlist_serializer.is_valid():
            playlist_serializer.save()
        else:
            logger.warning("Playlist serializer errors: %s", playlist_serializer.errors)
            return Response(
                playlist_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        task_id = None
        if len(new_tracks) > 0:
            task_id = util.brew(
                new_tracks=new_tracks,
                playlist_name=playlist_data.get("name"),
                platform=data.get("platform"),
            )
        return Response(
            {
                "task_id": task_id,
                "playlist_data": playlist_data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, playlist_id):
        Playlist.delete(self.get_object(playlist_id))
        return Response({"message": "Playlist removed"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def get_s3_presigned_url(request):
    if not settings.S3:
        return Response(
            {"message": "S3 is not configured"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )
    object_key = request.data.get("object_key")
    if not object_key:
        return Response(
            {"message": "object_key is required"}, status=status.HTTP_400_BAD_REQUEST
        )
    try:
        url = settings.S3.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": object_key},
            ExpiresIn=120,
        )
        return Response({"url": url}, status=status.HTTP_200_OK)
    except Exception:
        return Response(
            {"message": "Failed to generate URL"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def youtube_oauth_token(request):
    """Proxy YouTube OAuth token exchange to keep client_secret on the server."""
    data = request.data
    code = data.get("code")
    redirect_uri = data.get("redirect_uri")
    grant_type = data.get("grant_type", "authorization_code")

    if not redirect_uri:
        return Response(
            {"message": "redirect_uri is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    params = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "client_secret": settings.YOUTUBE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": grant_type,
    }

    if grant_type == "authorization_code":
        if not code:
            return Response(
                {"message": "code is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        params["code"] = code
    elif grant_type == "refresh_token":
        refresh_token = data.get("refresh_token")
        if not refresh_token:
            return Response(
                {"message": "refresh_token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        params["refresh_token"] = refresh_token

    response = http_requests.post(
        "https://oauth2.googleapis.com/token",
        data=params,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    return Response(response.json(), status=response.status_code)


def update_playlist_tracks(playlist, tracks):
    incoming_ids = {t.get("track_id") for t in tracks}
    existing_ids = set(playlist.tracks.values_list("track_id", flat=True))

    # Delete any removed tracks
    removed = existing_ids - incoming_ids
    if removed:
        playlist.tracks.filter(track_id__in=removed).delete()
        logger.info("Removed %d tracks from playlist %s", len(removed), playlist.name)

    # Add any new tracks
    new_ids = incoming_ids - existing_ids
    new_tracks = [t for t in tracks if t.get("track_id") in new_ids]
    for track in new_tracks:
        track_serializer = TrackSerializer(
            data={"playlist": playlist.pk, **track},
        )
        if track_serializer.is_valid():
            track_serializer.save()
        else:
            logger.warning("Track serializer errors: %s", track_serializer.errors)
            return Response(track_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if new_tracks:
        logger.info(
            "Added %d new tracks to playlist %s", len(new_tracks), playlist.name
        )
    return new_tracks
