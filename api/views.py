from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.serializers import UserSerializer, PlaylistSerializer, TrackSerializer
from brewery.models import Playlist, Track
from users.models import User
from brewery import views


# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]


class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(["GET"])
def get_logged_in(request):
    if request.method == "GET":
        return Response(
            {
                "status": "success",
                "data": {
                    "logged_in": request.user.is_authenticated,
                },
                "message": (
                    "User is logged in"
                    if request.user.is_authenticated
                    else "User is not logged in"
                ),
            },
            status=status.HTTP_200_OK,
        )


@api_view(["PUT"])
def brew(request):
    if request.method == "PUT":
        # Download music
        data = request.data.get("data", None)
        link = data.get("link", None)
        file_format = data.get("fileFormat", None)
        if not link or not file_format:
            return Response(
                {
                    "status": "error",
                    "message": "Link not provided",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Download music
        if path := brew(link, file_format):
            # Log the download
            if request.user.is_authenticated and (music_data := views.get_data(link)):
                # Determine if playlist
                if playlist_data := music_data.get("playlistData", None):
                    # Determine if playlist exists in user watchlist
                    try:
                        # Update playlist
                        playlist = Playlist.objects.get(
                            watcher=request.user, playlist_id=playlist_data["id"]
                        )
                        serializer = PlaylistSerializer(playlist, data=playlist_data)
                        if serializer.is_valid():
                            serializer.save()
                        else:
                            return Response(
                                serializer.errors, status=status.HTTP_400_BAD_REQUEST
                            )
                        exists = True
                    except Playlist.DoesNotExist:
                        # Create playlist
                        serializer = PlaylistSerializer(data=playlist_data)
                        if serializer.is_valid():
                            serializer.save()
                        else:
                            return Response(
                                serializer.errors, status=status.HTTP_400_BAD_REQUEST
                            )
                        exists = False

            return Response(
                {
                    "status": "success",
                    "data": {
                        "path": path,
                        "pk": playlist.pk if playlist else None,
                        "playlistExists": exists if exists else None,
                        "musicData": (
                            # Music data returned if logged in and link valid
                            music_data
                            if request.user.is_authenticated
                            and music_data.get("playlistData", None)
                            or music_data.get("trackData", None)
                            else None
                        ),
                    },
                    "message": "Music downloaded",
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {
                "status": "error",
                "message": "Invalid link",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["PUT"])
def update_playlist(request):
    # Also used to watch playlist
    if request.method == "PUT":
        if not request.user.is_authenticated:
            return Response(
                {
                    "status": "error",
                    "message": "User is not logged in",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        # Update playlist
        data = request.data.get("data", None)
        link = data.get("link", None)
        if not link:
            return Response(
                {
                    "status": "error",
                    "message": "Link not provided",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        playlist_data = views.get_data(link)["playlistData"]
        if not playlist_data:
            return Response(
                {
                    "status": "error",
                    "message": "Invalid playlist link",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            playlist = Playlist.objects.get(
                watcher=request.user, playlist_id=playlist_data["id"]
            )
            serializer = PlaylistSerializer(playlist, data=playlist_data)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Playlist.DoesNotExist:
            return Response(
                {
                    "status": "error",
                    "message": "Playlist does not exist",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "status": "success",
                "data": {
                    "playlistData": serializer.data,
                },
                "message": "Playlist updated",
            },
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
def download_playlist(request):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return Response(
                {
                    "status": "error",
                    "message": "User is not logged in",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        # Download playlist
        pass


@api_view(["DELETE"])
def delete_playlist(request):
    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return Response(
                {
                    "status": "error",
                    "message": "User is not logged in",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        # Delete playlist
        data = request.data.get("data", None)
        playlist_id = data.get("id", None)
        if not playlist_id:
            return Response(
                {
                    "status": "error",
                    "message": "Playlist ID not provided",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            playlist = Playlist.objects.get(
                watcher=request.user, playlist_id=playlist_id
            )
            playlist.delete()
        except Playlist.DoesNotExist:
            return Response(
                {
                    "status": "error",
                    "message": "Playlist does not exist",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "status": "success",
                "message": "Playlist deleted",
            },
            status=status.HTTP_200_OK,
        )
