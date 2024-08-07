import os, sys, requests, base64
from dotenv import load_dotenv
from .headers import *


# Load API keys from .env file
load_dotenv()

# Verify API keys
try:
    SPOTIFY_CLIENT_ID = os.environ["SPOTIFY_CLIENT_ID"]
    SPOTIFY_CLIENT_SECRET = os.environ["SPOTIFY_CLIENT_SECRET"]
except KeyError:
    print("ERROR: Missing Spotify API keys")
    sys.exit(1)


def _get_playlist_id(link):
    return link.split("playlist/")[1].split("?")[0]


def _get_track_id(link):
    return link.split("track/")[1].split("?")[0]


def _get_token():
    auth_string = SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET  # type: ignore
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + auth_base64,
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {"grant_type": "client_credentials"}
    response = requests.post(url, headers=headers, data=data)
    return response.json()["access_token"]


def get_auth_header(token):
    return {"Authorization": "Bearer " + token}


def get_spotify_playlist_data(link):
    """Get playlist data from Spotify playlist link

    Args:
        link (str): link to YouTube Spotify

    Returns:
        dict: dictionary containing playlist id, name, owner, platform, thumbnail, and tracks ({track_id, name, artist, platform}})
    """
    request_url = "https://api.spotify.com/v1/playlists/"
    tracks = []
    playlist_id = _get_playlist_id(link)
    response = requests.get(
        request_url + playlist_id,
        headers=get_auth_header(_get_token()),
    )

    if not response.ok:
        return

    try:
        # Add each track name and artist to list
        for item in response.json()["tracks"]["items"]:
            name = item["track"]["name"]
            artist = item["track"]["artists"][0]["name"]
            tracks.append(
                {
                    "track_id": item["track"]["id"],
                    "name": name,
                    "artist": artist,
                    "platform": SPOTIFY,
                }
            )
    except IndexError:
        return

    return {
        "playlist_id": playlist_id,
        "link": link,
        "name": response.json()["name"],
        "owner": response.json()["owner"]["display_name"],
        "platform": SPOTIFY,
        "thumbnail": response.json()["images"][0]["url"],
        "tracks": tracks,
    }


def get_spotify_track_data(link):
    """Get track data from Spotify track link

    Args:
        link (str): link to Spotify track

    Returns:
        dict: dictionary containing track id, name, artist, and platform
    """
    request_url = "https://api.spotify.com/v1/tracks/"
    track_id = _get_track_id(link)
    response = requests.get(
        request_url + track_id,
        headers=get_auth_header(_get_token()),
    )

    if not response.ok:
        return

    try:
        name = response.json()["name"]
        artist = response.json()["artists"][0]["name"]
    except IndexError:
        return

    return {
        "track_id": track_id,
        "name": name,
        "artist": artist,
        "platform": SPOTIFY,
    }
