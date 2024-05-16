from django.http import Http404
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
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
    if path := util.brew(link=link, file_format=file_format):
        # Log the download
        if request.user.is_authenticated and (music_data := util.get_data(link)):
            # Determine if playlist
            playlist = None
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
                    playlist = serializer.save()
                else:
                    print(serializer.errors)
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

                # Add tracks to playlist
                playlist_tracks = playlist_data.get("tracks")
                for track_data in playlist_tracks:
                    track_data["playlist"] = playlist.pk  # type: ignore
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
                    "pk": playlist.pk if playlist else None,  # type: ignore
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
        data = util.get_data(link)
        if data.get("contentType") == util.PLAYLIST:
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
        data = util.get_data(playlist.link)
        playlist_data = data.get("playlist_data", {})
        updated_tracklist = playlist_data.get("tracks")

        # Delete any removed tracks
        for track in playlist.tracks.all():  # type: ignore
            present = False
            for track2 in updated_tracklist:
                if track.track_id == track2.get("track_id"):
                    present = True
                    break
            if not present:
                track.delete()
                print(f"{track.name} removed from tracklist.")

        # Add any new tracks
        new_tracks = []
        for track in updated_tracklist:
            if not playlist.tracks.filter(track_id=track["track_id"]).exists():  # type: ignore
                new_tracks.append(track)
                track_serializer = TrackSerializer(
                    data={"playlist": playlist.pk, **track},
                )
                if track_serializer.is_valid():
                    track_serializer.save()
                    print(f"{track['name']} added to tracklist")
                else:
                    print(track_serializer.errors)
                    return Response(
                        track_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

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

        path = None
        if len(new_tracks) > 0:
            path = util.brew(
                new_tracks=new_tracks,
                playlist_name=playlist_data.get("name"),
                platform=data.get("platform"),
            )
        return Response(
            {"path": str(path) if path else None, "playlist_data": playlist_data},
            status=status.HTTP_200_OK,
        )

    def delete(self, request, playlist_id):
        Playlist.delete(self.get_object(playlist_id))
        return Response({"message": "Playlist removed"}, status=status.HTTP_200_OK)
