import sys, os, requests, base64
from dotenv import load_dotenv

PLAYLIST = "playlist"
PLAYLIST_URLS = ["list", "playlist", "album"]
TRACK = "track"
TRACK_URLS = ["watch", "track"]
YOUTUBE = "youtube"
YOUTUBE_URLS = ["youtube", "youtu.be"]
SPOTIFY = "spotify"
SPOTIFY_URLS = ["spotify"]


# Load API keys from .env file
load_dotenv()

# Verify API keys
try:
    YOUTUBE_API_KEY = os.environ["YOUTUBE_API_KEY"]
    SPOTIFY_CLIENT_ID = os.environ["SPOTIFY_CLIENT_ID"]
    SPOTIFY_CLIENT_SECRET = os.environ["SPOTIFY_CLIENT_SECRET"]
except KeyError:
    print("ERROR: Missing API keys")
    sys.exit(1)


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


def _get_auth_header(token):
    return {"Authorization": "Bearer " + token}


def get_platform(link):
    for url in YOUTUBE_URLS:
        if url in link:
            return YOUTUBE
    for url in SPOTIFY_URLS:
        if url in link:
            return SPOTIFY
    return None


def get_content_type(link):
    # Need to check for playlist first since single tracks in a playlist will also contain "list" in the URL
    content = None
    for url in PLAYLIST_URLS:
        if url in link:
            content = PLAYLIST
            break
    for url in TRACK_URLS:
        if url in link:
            return TRACK
    return content


def get_data(link):
    platform = get_platform(link)
    content_type = get_content_type(link)

    return {
        "platform": platform,
        "contentType": content_type,
        "playlist_data": (
            get_playlist_data(link, platform) if content_type == PLAYLIST else None
        ),
        "track_data": (
            get_track_data(link, platform) if content_type == TRACK else None
        ),
    }


def get_playlist_data(link, platform):
    if platform == YOUTUBE:
        return get_youtube_playlist_data(link)
    if platform == SPOTIFY:
        return get_spotify_playlist_data(link)
    return None  # Invalid platform


def get_track_data(link, platform):
    if platform == YOUTUBE:
        return get_youtube_track_data(link)
    elif platform == SPOTIFY:
        return get_spotify_track_data(link)
    return None  # Invalid platform


def get_id(link, platform, content_type):
    """Get id from YouTube or Spotify link

    Args:
        link (str): link to YouTube or Spotify track or playlist

    Returns:
        str: id of track or playlist
    """
    if platform == YOUTUBE:
        if content_type == PLAYLIST:
            return link.split("list=")[1].split("&")[0]
        return link.split("watch?v=")[1].split("&")[0]
    if platform == SPOTIFY:
        if content_type == PLAYLIST:
            return link.split("playlist/")[1].split("?")[0]
        return link.split("track/")[1].split("?")[0]
    return ""


def get_playlist_link(platform, id_):
    """Get playlist link from YouTube or Spotify id

    Args:
        id (str): id of YouTube or Spotify playlist

    Returns:
        str: link to playlist
    """
    if platform == YOUTUBE:
        return f"https://www.youtube.com/playlist?list={id_}"
    elif platform == SPOTIFY:
        return f"https://open.spotify.com/playlist/{id_}"
    return ""


def get_track_link(platform, id_):
    """Get track link from YouTube or Spotify id

    Args:
        platform (str): platform of track (youtube or spotify)
        id_ (str): id of YouTube or Spotify track

    Returns:
        str: link to track
    """
    if platform == YOUTUBE:
        return f"https://www.youtube.com/watch?v={id_}"
    elif platform == SPOTIFY:
        return f"https://open.spotify.com/track/{id_}"
    return ""


def get_youtube_playlist_data(link):
    """Get playlist data from YouTube playlist link

    Args:
        link (str): link to YouTube playlist

    Returns:
        dict: dictionary containing playlist id, name, owner, platform, thumbnail, and tracks ({track_id, name, artist, platform}})
    """
    playlist_id = get_id(link, platform=YOUTUBE, content_type=PLAYLIST)

    # Get playlist title, owner, and thumbnail from different API endpoint
    response = requests.get(
        "https://www.googleapis.com/youtube/v3/playlists",
        params={
            "part": "snippet",
            "id": playlist_id,
            "key": YOUTUBE_API_KEY,
        },
    )
    playlist_name = response.json()["items"][0]["snippet"]["title"]
    playlist_owner = response.json()["items"][0]["snippet"]["channelTitle"]
    playlist_thumbnail = response.json()["items"][0]["snippet"]["thumbnails"][
        "standard"
    ]["url"]

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
    track_id = get_id(link, platform=YOUTUBE, content_type=TRACK)

    # Get track name and artist from video details
    response = requests.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={
            "part": "snippet",
            "id": track_id,
            "key": YOUTUBE_API_KEY,
        },
    )
    track_title = response.json()["items"][0]["snippet"]["title"]
    track_artist = response.json()["items"][0]["snippet"]["channelTitle"]

    return {
        "playlist_id": track_id,
        "name": track_title,
        "artist": track_artist,
        "platform": YOUTUBE,
    }


def get_spotify_track_data(link):
    """Get track data from Spotify track link

    Args:
        link (str): link to Spotify track

    Returns:
        dict: dictionary containing track id, name, artist, and platform
    """
    request_url = "https://api.spotify.com/v1/tracks/"
    track_id = get_id(link, platform=SPOTIFY, content_type=TRACK)
    response = requests.get(
        request_url + track_id,
        headers=_get_auth_header(_get_token()),
    )
    name = response.json()["name"]
    artist = response.json()["artists"][0]["name"]

    return {
        "track_id": track_id,
        "name": name,
        "artist": artist,
        "platform": SPOTIFY,
    }


def get_spotify_playlist_data(link):
    """Get playlist data from Spotify playlist link

    Args:
        link (str): link to YouTube Spotify

    Returns:
        dict: dictionary containing playlist id, name, owner, platform, thumbnail, and tracks ({track_id, name, artist, platform}})
    """
    request_url = "https://api.spotify.com/v1/playlists/"
    tracks = []
    playlist_id = get_id(link, platform=SPOTIFY, content_type=PLAYLIST)
    response = requests.get(
        request_url + playlist_id,
        headers=_get_auth_header(_get_token()),
    )

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

    return {
        "playlist_id": playlist_id,
        "link": link,
        "name": response.json()["name"],
        "owner": response.json()["owner"]["display_name"],
        "platform": SPOTIFY,
        "thumbnail": response.json()["images"][0]["url"],
        "tracks": tracks,
    }
