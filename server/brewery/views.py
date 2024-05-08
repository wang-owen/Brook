from django.http import Http404
from rest_framework import status, generics, mixins, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from . import util
from brewery.models import Playlist
from brewery.serializers import PlaylistSerializer, TrackSerializer


# Create your views here.
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
    if path := util.brew(link, file_format):
        # Log the download
        if request.user.is_authenticated and (music_data := util.get_data(link)):
            # Determine if playlist
            playlist = None
            playlist_instance = None
            if playlist_data := music_data.get("playlist_data"):
                playlist_data["watcher"] = request.user.id
                try:
                    # Update playlist
                    playlist = Playlist.objects.get(
                        watcher=request.user,
                        playlist_id=playlist_data.get("playlist_id"),
                    )
                    serializer = PlaylistSerializer(playlist, data=playlist_data)
                except Playlist.DoesNotExist:
                    # Create playlist
                    serializer = PlaylistSerializer(data=playlist_data)

                if serializer.is_valid():
                    playlist_instance = serializer.save()
                else:
                    print(serializer.errors)
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

                # Add tracks to playlist
                playlist_tracks = playlist_data.get("tracks")
                for track_data in playlist_tracks:
                    track_data["playlist"] = playlist_instance.pk  # type: ignore
                    serializer = TrackSerializer(data=track_data)
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        print(serializer.errors)
                        return Response(
                            serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )

            return Response(
                {
                    "path": str(path),
                    "pk": playlist.pk if playlist else None,
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
    return util.get_file(path)


class PlaylistList(APIView):
    """
    List all watched playlists, or begin watching a new playlist.
    """

    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    # List all watched playlists by user
    def get(self, request, *args, **kwargs):
        return Response(
            [
                PlaylistSerializer(playlist).data
                for playlist in Playlist.objects.filter(watcher=self.request.user)
            ],
            status=status.HTTP_200_OK,
        )

    # Create new playlist and add to user watched list
    def post(self, request, *args, **kwargs):
        link = request.data.get("link")
        data = util.get_data(link)
        if data.get("contentType") == util.PLAYLIST:
            playlistSerializer = PlaylistSerializer(
                data={
                    "watcher": self.request.user,
                    "playlist_id": data.get("playlist_id"),
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
                            "track_id": data.get("track_id"),
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


class PlaylistDetail(
    generics.GenericAPIView, mixins.RetrieveModelMixin, mixins.DestroyModelMixin
):
    """
    Retrieve, update, or delete a playlist instance.
    """

    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return Playlist.objects.get(pk=pk)
        except Playlist.DoesNotExist:
            raise Http404

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, pk):
        playlist = self.get_object(pk)
        # Retrieve new information from server and update playlist
        data = util.get_data(playlist.link)
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

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
