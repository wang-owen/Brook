from rest_framework import status, generics, mixins
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import Http404
from api.serializers import UserSerializer, PlaylistSerializer, TrackSerializer
from server import views as server
from server.models import Playlist, Track
from users.models import User


# Create your views here.
@api_view(["POST"])
def brew(request):
    if request.method == "POST":
        # Download music
        data = request.data
        link = data.get("link")
        file_format = data.get("fileFormat", "m4a")
        if not data or not link or not file_format:
            return Response(
                {"message": "Link not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Download music
        if path := server.brew(link, file_format):
            # Log the download
            if request.user.is_authenticated and (music_data := server.get_data(link)):
                # Determine if playlist
                if playlist_data := music_data.get("playlistData"):
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
                        "path": str(path),
                        "pk": playlist.pk if playlist else None,
                        "playlistExists": exists if exists else None,
                        "musicData": (
                            # Music data returned if logged in and link valid
                            music_data
                            if request.user.is_authenticated
                            and music_data.get("playlistData")
                            or music_data.get("trackData")
                            else None
                        ),
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {"path": str(path)},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"message": "Invalid link"},
            status=status.HTTP_400_BAD_REQUEST,
        )


def download(request, path):
    return server.get_file(path)


class PlaylistList(generics.GenericAPIView):
    """
    List all watched playlists, or begin watching a new playlist.
    """

    serializer_class = PlaylistSerializer

    # List all watched playlists by user
    def get(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return Response(
                Playlist.objects.filter(watcher=self.request.user),
                status=status.HTTP_200_OK,
            )
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    # Create new playlist and add to user watched list
    def post(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            link = request.data.get("link")
            data = server.get_data(link)
            if data.get("contentType") == server.util.PLAYLIST:
                playlistSerializer = PlaylistSerializer(
                    data={
                        "watcher": self.request.user,
                        "playlist_id": data.get("id"),
                        "link": link,
                        "platform": data.get("platform"),
                        "name": data.get("name"),
                        "owner": data.get("owner"),
                    }
                )
                if playlistSerializer.is_valid():
                    playlist = playlistSerializer.save()

                if trackData := data.get("trackData"):
                    for data in trackData:
                        trackSeralizer = TrackSerializer(
                            data={
                                "playlist": playlist,
                                "track_id": data.get("id"),
                                "name": data.get("name"),
                                "artist": data.get("artist"),
                                "platform": data.get("platform"),
                            }
                        )
                        if trackSeralizer.is_valid():
                            trackSeralizer.save()

                return Response(status=status.HTTP_201_CREATED)

            # Link is not a playlist
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        # User not logged in
        return Response(status=status.HTTP_401_UNAUTHORIZED)


class PlaylistDetail(
    generics.GenericAPIView, mixins.RetrieveModelMixin, mixins.DestroyModelMixin
):
    """
    Retrieve, update, or delete a playlist instance
    """

    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

    def get_object(self, pk):
        try:
            return Playlist.objects.get(pk=pk)
        except Playlist.DoesNotExist:
            raise Http404

    def get(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return self.retrieve(request, *args, **kwargs)
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    def put(self, request, pk):
        if self.request.user.is_authenticated:
            playlist = self.get_object(pk)
            # Retrieve new information from server and update playlist
            data = server.get_data(playlist.link)
            updated_tracklist = data.get("playlistData", {}).get("tracks")

            # Delete any removed tracks
            for track in playlist.tracks.all():
                if track.track_id not in updated_tracklist:
                    track.delete()

            # Add any new tracks
            for track in updated_tracklist:
                if not playlist.filter(track_id=track["track_id"]).exists():  # type: ignore
                    trackSerializer = TrackSerializer(
                        data={
                            "playlist": playlist,
                            "track_id": track["track_id"],
                            "name": track["name"],
                            "artist": track["artist"],
                            "platform": track["platform"],
                        },
                    )
                    if trackSerializer.is_valid():
                        trackSerializer.save()

            # Update playlist data
            playlistSerializer = PlaylistSerializer(playlist, data=data)
            if playlistSerializer.is_valid():
                playlistSerializer.save()

            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)

    def delete(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_401_UNAUTHORIZED)
