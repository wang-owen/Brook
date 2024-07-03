from django.http import Http404
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from . import util
from ..common import utils
from brewery.models import Playlist
from brewery.serializers import PlaylistSerializer, TrackSerializer
from .tasks import check_task_status


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
            {"status": "SUCCESS", "path": task.get("result")}, status=status.HTTP_200_OK
        )
    return Response({"status": "PENDING"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def brew(request):
    data = request.data
    link = data.get("link")
    file_format = data.get("fileFormat", "m4a")
    if not data or not link or not file_format:
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
                else:
                    print(serializer.errors)
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )
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
        playlists = [
            PlaylistSerializer(playlist).data
            for playlist in Playlist.objects.filter(watcher=self.request.user).order_by(
                "-last_modified"
            )
        ]
        return Response(
            playlists,
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
                    print(playlist_serializer.errors)
                    return Response(
                        playlist_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

                if trackData := playlist_data.get("tracks"):
                    for track in trackData:
                        trackSeralizer = TrackSerializer(
                            data={"playlist": playlist.pk, **track}  # type: ignore
                        )
                        if trackSeralizer.is_valid():
                            trackSeralizer.save()
                        else:
                            print(trackSeralizer.errors)
                            return Response(
                                trackSeralizer.errors,
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                return Response(playlist_data, status=status.HTTP_201_CREATED)

        # Link is not a playlist
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


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
            print(playlist_serializer.errors)
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


def update_playlist_tracks(playlist, tracks):
    # Delete any removed tracks
    for track in playlist.tracks.all():
        present = False
        for track2 in tracks:
            if track.track_id == track2.get("track_id"):
                present = True
                break
        if not present:
            track.delete()
            print(f"{track.name} removed from tracklist.")

    # Add any new tracks
    new_tracks = []
    for track in tracks:
        if not playlist.tracks.filter(track_id=track["track_id"]).exists():
            new_tracks.append(track)
            track_serializer = TrackSerializer(
                data={"playlist": playlist.pk, **track},
            )
            if track_serializer.is_valid():
                track_serializer.save()
            else:
                print(track_serializer.errors)
                return Response(
                    track_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                )
    return new_tracks
