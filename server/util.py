import sys, os, base64, shutil, requests, yt_dlp
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from django.conf import settings

PLAYLIST = "playlist"
PLAYLIST_URLS = ["list", "playlist", "album"]
TRACK = "track"
TRACK_URLS = ["watch", "track"]
YOUTUBE = "youtube"
YOUTUBE_URLS = ["youtube", "youtu.be"]
SPOTIFY = "spotify"
SPOTIFY_URLS = ["spotify"]

ILLEGAL_CHARS = [
    "#",
    "%",
    "&",
    "{",
    "}",
    "\\",
    "<",
    ">",
    "*",
    "?",
    "/",
    "$",
    "!",
    "'",
    '"',
    ":",
    "@",
    "+",
    "`",
    "|",
    "=",
    ";",
]

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


MUSIC_DIR = settings.MUSIC_DIR
PLAYLISTS_DIR = MUSIC_DIR / "Playlists"
TRACKS_DIR = MUSIC_DIR / "Tracks"
DEFAULT_FILE_FORMAT = "m4a"

if not MUSIC_DIR.exists():
    MUSIC_DIR.mkdir()
if not PLAYLISTS_DIR.exists():
    PLAYLISTS_DIR.mkdir()
if not TRACKS_DIR.exists():
    TRACKS_DIR.mkdir()


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


def download_playlist(link, file_format, platform):
    dir_ = PLAYLISTS_DIR / datetime.utcnow().strftime("%Y-%m-%d %H-%M-%S")
    if dir_.exists():
        return False
    dir_.mkdir()

    if platform == YOUTUBE:
        return _download_youtube_playlist(link, file_format, dir_)
    elif platform == SPOTIFY:
        return _download_spotify_playlist(link, file_format, dir_)
    return False


def download_track(link, file_format, platform):
    dir_ = TRACKS_DIR / datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
    if dir_.exists():
        return False
    dir_.mkdir()

    if platform == YOUTUBE:
        return _download_youtube_track(link, file_format, dir_)
    elif platform == SPOTIFY:
        return _download_spotify_track(link, file_format, dir_)
    return False


def get_playlist_data(link, platform):
    if platform == YOUTUBE:
        return _get_youtube_playlist_data(link)
    if platform == SPOTIFY:
        return _get_spotify_playlist_data(link)
    return None  # Invalid platform


def get_track_data(link, platform):
    if platform == YOUTUBE:
        return _get_youtube_track_data(link)
    elif platform == SPOTIFY:
        return _get_spotify_track_data(link)
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


def _get_track_link(platform, id_):
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


def _get_youtube_playlist_data(link):
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
                    "id": track_id,
                    "name": track_name,
                    "artist": track_artist,
                    "platform": YOUTUBE,
                }
            )

        if not (pageToken := response.json().get("nextPageToken")):
            break

    return {
        "id": playlist_id,
        "name": playlist_name,
        "owner": playlist_owner,
        "platform": YOUTUBE,
        "thumbnail": playlist_thumbnail,
        "tracks": tracks,
    }


def _get_youtube_track_data(link):
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
        "id": track_id,
        "name": track_title,
        "artist": track_artist,
        "platform": YOUTUBE,
    }


def _get_spotify_track_data(link):
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
        "id": track_id,
        "name": name,
        "artist": artist,
        "platform": SPOTIFY,
    }


def _get_spotify_playlist_data(link):
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
                "id": item["track"]["id"],
                "name": name,
                "artist": artist,
                "platform": SPOTIFY,
            }
        )

    return {
        "id": playlist_id,
        "name": response.json()["name"],
        "owner": response.json()["owner"]["display_name"],
        "platform": SPOTIFY,
        "thumbnail": response.json()["images"][0]["url"],
        "tracks": tracks,
    }


def _download_youtube_track(link, file_format, dir_):
    """Download YouTube track or playlist from link

    Args:
        link (str): link to YouTube track or playlist
        file_format (str): file format to download tracks in
        dir_ (str): directory to download tracks to
    """
    ydl_opts = {
        "outtmpl": f"{dir_}/%(title)s [%(id)s].%(ext)s",
        "format": f"ba[ext={file_format}]",
        "restrictfilenames": True,
        "writethumbnail": True,
        "embedthumbnail": True,
        "noplaylist": True,
        "postprocessors": [
            {
                "key": "FFmpegMetadata",
                "add_metadata": True,
            },
            {
                "key": "EmbedThumbnail",
            },
        ],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        path = ydl.prepare_filename(ydl.extract_info(link, download=True))

        print(path)
        return Path(path)


def _download_youtube_playlist(link, file_format, dir_):
    """Download YouTube track or playlist from link

    Args:
        link (str): link to YouTube track or playlist
        file_format (str): file format to download tracks in
        dir_ (str): directory to download tracks to
    """
    playlist_name = _get_youtube_playlist_data(link)["name"]
    # Remove illegal filename characters from playlist name
    for char in ILLEGAL_CHARS:
        playlist_name = playlist_name.replace(char, "-")
    playlist_dir = dir_ / playlist_name

    ydl_opts = {
        "outtmpl": f"{playlist_dir}/%(title)s [%(id)s].%(ext)s",
        "format": f"ba[ext={file_format}]",
        "writethumbnail": True,
        "embedthumbnail": True,
        "postprocessors": [
            {
                "key": "FFmpegMetadata",
                "add_metadata": True,
            },
            {
                "key": "EmbedThumbnail",
            },
        ],
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([link])

    # Delete leftover thumbnail file
    for img_file in Path(playlist_dir).glob("*.jpg"):
        img_file.unlink()

    # Compress folder
    path = shutil.make_archive(str(playlist_dir), "zip", playlist_dir)
    shutil.rmtree(playlist_dir)

    return Path(path)


def _download_youtube_search(name, artist, file_format, dir_):
    """Download YouTube track from search query

    Args:
        name (str): track name
        artist (str): artist name
        file_format (str): file format to download track in
        dir_ (str): directory to download tracks to
    """
    ydl_opts = {
        "outtmpl": f"{dir_}/%(title)s [%(id)s].%(ext)s",
        "format": f"ba[ext={file_format}]",
        "restrictfilenames": True,
        "writethumbnail": True,
        "embedthumbnail": True,
        "noplaylist": True,
        "postprocessors": [
            {
                "key": "FFmpegMetadata",
                "add_metadata": True,
            },
            {
                "key": "EmbedThumbnail",
            },
        ],
        "default_search": "https://music.youtube.com/search?q=",
        "playlist_items": "1",
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        path = ydl.prepare_filename(ydl.extract_info(f"{name} {artist}", download=True))

        return Path(path)


def _download_spotify_track(link, file_format, dir_):
    """Download Spotify track from link

    Args:
        link (str): link to Spotify track
        file_format (str): file format to download track in
        dir_ (str): directory to download tracks to
    """
    data = _get_spotify_track_data(link)
    track_name, track_artist = data["name"], data["artist"]

    return _download_youtube_search(track_name, track_artist, file_format, dir_)


def _download_spotify_playlist(link, file_format, dir_):
    """Download Spotify playlist from link

    Args:
        link (str): link to Spotify playlist
        file_format (str): file format to download tracks in
        dir_ (str): directory to download tracks to
    """
    data = _get_spotify_playlist_data(link)
    playlist_name = data["name"]
    # Remove illegal filename characters from playlist name
    for char in ILLEGAL_CHARS:
        playlist_name = playlist_name.replace(char, "-")
    playlist_dir = dir_ / playlist_name

    tracks = data["tracks"]
    for track in tracks:
        _download_youtube_search(
            track["name"], track["artist"], file_format, playlist_dir
        )

    # Compress folder
    path = shutil.make_archive(str(playlist_dir), "zip", playlist_dir)
    shutil.rmtree(playlist_dir)

    return Path(path)
