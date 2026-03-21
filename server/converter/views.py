import requests
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from common import utils, youtube, spotify
from common.headers import YOUTUBE
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
    if not playlist_data:
        return Response(
            {"message": "Could not fetch playlist data"}, status=status.HTTP_400_BAD_REQUEST
        )

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

    if not response.ok:
        return Response(response.json(), status=status.HTTP_400_BAD_REQUEST)

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
        if not search:
            continue
        track_id = search[0]["videoId"]

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
    if not playlist_data:
        return Response(
            {"message": "Could not fetch playlist data"}, status=status.HTTP_400_BAD_REQUEST
        )

    tracks = playlist_data.get("tracks", [])

    # Make post request to Spotify to create playlist
    response = requests.post(
        f"https://api.spotify.com/v1/users/{user_id}/playlists",
        json={"name": playlist_data.get("name"), "public": False},
        headers=spotify.get_auth_header(access_token),
    )
    if not response.ok:
        return Response(response.json(), status=status.HTTP_400_BAD_REQUEST)

    playlist_url = response.json()["external_urls"]["spotify"]
    playlist_id = response.json()["id"]

    # Get track URIs for each track
    track_uris = []
    for track in tracks:
        search_response = requests.get(
            "https://api.spotify.com/v1/search",
            params={
                "q": f"{track.get('name')} artist:{track.get('artist')}",
                "type": "track",
                "limit": 1,
            },
            headers=spotify.get_auth_header(access_token),
        )
        items = search_response.json().get("tracks", {}).get("items", [])
        if items:
            track_uris.append(items[0]["uri"])

    if track_uris:
        response = requests.post(
            f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks",
            json={"uris": track_uris},
            headers=spotify.get_auth_header(access_token),
        )
        if not response.ok:
            return Response(response.json(), status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {
            "message": "Playlist converted",
            "url": playlist_url,
        },
        status=status.HTTP_200_OK,
    )
