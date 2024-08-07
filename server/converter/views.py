import requests
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from common import utils, youtube, spotify
from common.headers import *
from ytmusicapi import YTMusic


@api_view(["PUT"])
def toyoutube(request):
    data = request.data
    access_token = data.get("access_token")
    link = data.get("link")

    if not access_token or utils.get_content_type(link) != utils.PLAYLIST:
        return Response(
            {"message": "Link must be a playlist"}, status=status.HTTP_400_BAD_REQUEST
        )

    playlist_data = utils.get_playlist_data(link, utils.get_platform(link))
    if playlist_data:
        tracks = playlist_data.get("tracks", [])

        # Make post request to YouTube to create playlist
        response = requests.post(
            "https://www.googleapis.com/youtube/v3/playlists?part=snippet%2Cstatus",
            json={
                "snippet": {
                    "title": playlist_data.get("name"),
                },
                "status": {"privacyStatus": "private"},
            },
            headers=youtube.get_auth_header(access_token),
        )

        if response.ok:
            playlist_id = response.json()["id"]
            playlist_url = utils.get_playlist_link(YOUTUBE, playlist_id)

            # Get track URIs for each track
            ytmusic = YTMusic()
            for track in tracks:
                search = ytmusic.search(
                    query=f"{track.get('name')} {track.get('artist')}",
                    filter="songs",
                    limit=1,
                )
                track_id = search[0]["videoId"]

                # Search with API (inaccurate)
                # response = requests.get(
                #     "https://music.youtube.com/youtube/v3/search",
                #     json={
                #         "part": "snippet",
                #         "maxResults": 1,
                #         "q": f"{track.get('name')} artist:{track.get('artist')}",
                #         "type": "video",
                #         "videoCategoryId": 10,  # Category ID for Music
                #     },
                #     headers=youtube.get_auth_header(access_token),
                # )
                # tracks[i] = response.json()["items"][0]["id"]

                if not requests.post(
                    "https://www.googleapis.com/youtube/v3/playlistItems",
                    params={"part": "snippet"},
                    json={
                        "snippet": {
                            "playlistId": playlist_id,
                            "resourceId": {
                                "kind": "youtube#video",
                                "videoId": track_id,
                            },
                        }
                    },
                    headers=youtube.get_auth_header(access_token),
                ).ok:
                    break

            return Response(
                {
                    "message": "Playlist converted",
                    "url": playlist_url,
                },
                status=status.HTTP_200_OK,
            )

    return Response(response.json(), status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
def tospotify(request):
    data = request.data
    access_token = data.get("access_token")
    user_id = data.get("user_id")
    link = data.get("link")

    if not access_token or utils.get_content_type(link) != utils.PLAYLIST:
        return Response(
            {"message": "Link must be a playlist"}, status=status.HTTP_400_BAD_REQUEST
        )

    playlist_data = utils.get_playlist_data(link, utils.get_platform(link))
    if playlist_data:
        tracks = playlist_data.get("tracks", [])

        # Make post request to Spotify to create playlist
        response = requests.post(
            f"https://api.spotify.com/v1/users/{user_id}/playlists",
            json={"name": playlist_data.get("name"), "public": False},
            headers=spotify.get_auth_header(access_token),
        )
        if response.ok:
            playlist_url = response.json()["external_urls"]["spotify"]
            playlist_id = response.json()["id"]

            # Get track URIs for each track
            for i, track in enumerate(tracks):
                response = requests.get(
                    "https://api.spotify.com/v1/search",
                    params={
                        "q": f"{track.get('name')}%20artist:{track.get('artist')}",
                        "type": "track",
                        "limit": 1,
                    },
                    headers=spotify.get_auth_header(access_token),
                )
                tracks[i] = response.json()["tracks"]["items"][0]["uri"]

            response = requests.post(
                f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks",
                json={"uris": tracks},
                headers=spotify.get_auth_header(access_token),
            )
            if response.ok:
                return Response(
                    {
                        "message": "Playlist converted",
                        "url": playlist_url,
                    },
                    status=status.HTTP_200_OK,
                )

    return Response(response.json(), status=status.HTTP_400_BAD_REQUEST)
