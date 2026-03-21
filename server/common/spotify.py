import logging
import os
import requests
import base64
from dotenv import load_dotenv
from .headers import SPOTIFY

logger = logging.getLogger(__name__)

# Load API keys from .env file
load_dotenv()

SPOTIFY_CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET", "")
if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
    logger.warning("Missing Spotify API keys")


def _get_playlist_id(link):
    return link.split("playlist/")[1].split("?")[0]


def _get_track_id(link):
    return link.split("track/")[1].split("?")[0]


def _get_token():
    auth_string = SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + auth_base64,
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {"grant_type": "client_credentials"}
    response = requests.post(url, headers=headers, data=data)
    token_data = response.json()
    if "access_token" not in token_data:
        raise RuntimeError(f"Failed to get Spotify token: {token_data}")
    return token_data["access_token"]


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

    # Add each track name and artist to list
    for item in response.json().get("tracks", {}).get("items", []):
        track = item.get("track")
        if not track:
            continue
        artists = track.get("artists", [])
        name = track.get("name", "")
        artist = artists[0]["name"] if artists else "Unknown"
        tracks.append(
            {
                "track_id": track.get("id", ""),
                "name": name,
                "artist": artist,
                "platform": SPOTIFY,
            }
        )

    data = response.json()
    images = data.get("images", [])
    return {
        "playlist_id": playlist_id,
        "link": link,
        "name": data.get("name", ""),
        "owner": data.get("owner", {}).get("display_name", "Unknown"),
        "platform": SPOTIFY,
        "thumbnail": images[0]["url"] if images else "",
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

    data = response.json()
    name = data.get("name", "")
    artists = data.get("artists", [])
    artist = artists[0]["name"] if artists else "Unknown"

    return {
        "track_id": track_id,
        "name": name,
        "artist": artist,
        "platform": SPOTIFY,
    }
