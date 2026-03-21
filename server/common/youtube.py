import logging
import os
import requests
from dotenv import load_dotenv
from .headers import YOUTUBE

logger = logging.getLogger(__name__)

# Load API keys from .env file
load_dotenv()

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")
if not YOUTUBE_API_KEY:
    logger.warning("Missing YouTube API key")


def _get_playlist_id(link):
    return link.split("list=")[1].split("&")[0]


def _get_track_id(link):
    if "watch?v=" in link:
        return link.split("watch?v=")[1].split("&")[0]
    return link.split("?")[1].split("&")[0]


def get_auth_header(token):
    return {"Authorization": "Bearer " + token}


def get_youtube_playlist_data(link):
    """Get playlist data from YouTube playlist link

    Args:
        link (str): link to YouTube playlist

    Returns:
        dict: dictionary containing playlist id, name, owner, platform, thumbnail, and tracks ({track_id, name, artist, platform}})
    """
    playlist_id = _get_playlist_id(link)

    # Get playlist title, owner, and thumbnail from different API endpoint
    response = requests.get(
        "https://www.googleapis.com/youtube/v3/playlists",
        params={
            "part": "snippet",
            "id": playlist_id,
            "key": YOUTUBE_API_KEY,
        },
    )

    if not response.ok:
        return

    data = response.json()
    items = data.get("items", [])
    if not items:
        return

    snippet = items[0].get("snippet", {})
    playlist_name = snippet.get("title", "")
    playlist_owner = snippet.get("channelTitle", "Unknown")
    thumbnails = snippet.get("thumbnails", {})
    playlist_thumbnail = thumbnails.get("standard", thumbnails.get("default", {})).get("url", "")

    request_url = "https://www.googleapis.com/youtube/v3/playlistItems"
    tracks = []
    pageToken = None
    while True:
        response = requests.get(
            request_url,
            params={
                "part": "snippet",
                "pageToken": pageToken,
                "maxResults": 50,
                "playlistId": playlist_id,
                "key": YOUTUBE_API_KEY,
            },
        )

        # Add each track name and artist to list
        for item in response.json()["items"]:
            track_id = item["snippet"]["resourceId"]["videoId"]
            track_name = item["snippet"]["title"]
            track_artist = item["snippet"]["videoOwnerChannelTitle"].split(" - ")[0]
            tracks.append(
                {
                    "track_id": track_id,
                    "name": track_name,
                    "artist": track_artist,
                    "platform": YOUTUBE,
                }
            )

        if not (pageToken := response.json().get("nextPageToken")):
            break

    return {
        "playlist_id": playlist_id,
        "link": link,
        "name": playlist_name,
        "owner": playlist_owner,
        "platform": YOUTUBE,
        "thumbnail": playlist_thumbnail,
        "tracks": tracks,
    }


def get_youtube_track_data(link):
    """Get track data from YouTube track link

    Args:
        link (str): link to YouTube track

    Returns:
        dict: dictionary containing track id, name, artist, and platform
    """
    track_id = _get_track_id(link)

    # Get track name and artist from video details
    response = requests.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={
            "part": "snippet",
            "id": track_id,
            "key": YOUTUBE_API_KEY,
        },
    )

    if not response.ok:
        return

    data = response.json()
    items = data.get("items", [])
    if not items:
        return

    snippet = items[0].get("snippet", {})
    track_title = snippet.get("title", "")
    track_artist = snippet.get("channelTitle", "Unknown")

    return {
        "playlist_id": track_id,
        "name": track_title,
        "artist": track_artist,
        "platform": YOUTUBE,
    }
