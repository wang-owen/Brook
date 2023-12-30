import sys
from os import environ
import base64
import shutil
from datetime import datetime
import requests
import yt_dlp
import pathlib
from dotenv import load_dotenv
from . import models
from django.conf import settings

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
    "[",
    "]",
    "(",
    ")",
]

# Load API keys from .env file
load_dotenv()

# Verify API keys
try:
    YOUTUBE_API_KEY = environ["YOUTUBE_API_KEY"]
    SPOTIFY_CLIENT_ID = environ["SPOTIFY_CLIENT_ID"]
    SPOTIFY_CLIENT_SECRET = environ["SPOTIFY_CLIENT_SECRET"]
except KeyError:
    print("ERROR: Missing API keys")
    sys.exit(1)


MUSIC_DIR = settings.MUSIC_DIR
PLAYLISTS_DIR = pathlib.Path.joinpath(MUSIC_DIR, "Playlists")
TRACKS_DIR = pathlib.Path.joinpath(MUSIC_DIR, "Tracks")
DEFAULT_FILE_FORMAT = "m4a"


def download_music(link, file_format):
    """Download music from YouTube or Spotify link

    Args:
        link (str): link to YouTube or Spotify track or playlist
        file_format (str): file format to download tracks in

    Returns:
        dict: dictionary containing file path, whether link is to a playlist, and whether playlist already exists
    """
    dir_ = pathlib.Path.joinpath(
        TRACKS_DIR, datetime.utcnow().strftime("%Y-%m-%d %H-%M-%S")
    )

    # Determine whether link is to a playlist or track
    is_playlist = False
    exists = None
    if "list" in link:
        is_playlist = True
    if "watch" in link:
        is_playlist = False
    if is_playlist:
        dir_ = pathlib.Path.joinpath(
            PLAYLISTS_DIR, datetime.utcnow().strftime("%Y-%m-%d %H-%M-%S")
        )
        exists = models.Playlist.objects.filter(id=get_id(link)).exists()

    path, platform = None, None
    if "youtube" in link or "youtu.be" in link:
        platform = "youtube"
        if is_playlist:
            path = _download_youtube_playlist(link, file_format, dir_)
        else:
            path = _download_youtube_track(link, file_format, dir_)
    elif "spotify" in link:
        platform = "spotify"
        if is_playlist:
            path = _download_spotify_playlist(link, file_format, dir_)
        else:
            path = _download_spotify_track(link, file_format, dir_)

    # Log or update (if existing) playlist
    if is_playlist:
        if models.Playlist.objects.filter(id=get_id(link)).exists():
            update_playlist(get_id(link), file_format)
        else:
            log_playlist(get_playlist_data(link, platform), True)

    return {
        "path": path,
        "is_playlist": is_playlist,
        "exists": exists,
    }


def get_playlist_data(link, platform):
    """Return track name and artist for each track in playlist

    Args:
        link (str): link to playlist
        platform (str): playlist platform (spotify or youtube)
    """
    if platform == "youtube":
        return _get_youtube_playlist_data(link)
    elif platform == "spotify":
        return _get_spotify_playlist_data(link)
    return {}


def update_playlist(id, file_format):
    """Updates playlist with new tracks and removes old tracks, downloads new tracks, and returns zip file path

    Args:
        id (str): id of playlist
        file_format (str): file format to download tracks in

    Returns:
        Path: path to zip file containing new tracks
    """
    if playlist := models.Playlist.objects.get(id=id):
        playlist_name = playlist.name
        for char in ILLEGAL_CHARS:
            playlist_name = playlist_name.replace(char, "-")
        dir_ = pathlib.Path.joinpath(
            MUSIC_DIR,
            datetime.utcnow().strftime("%Y-%m-%d %H-%M-%S"),
            f"UPDATED-{playlist_name}",
        )

        link = get_playlist_link(playlist.platform, playlist.id)
        data = get_playlist_data(link, playlist.platform)

        old_tracks = playlist.tracks.all()  # type: ignore
        new_tracks = data["tracks"]
        updated_tracks = []

        # Add new tracks
        for track in new_tracks:
            if not old_tracks.filter(id=track["track_id"]).exists():
                updated_tracks.append(
                    _get_track_link(playlist.platform, track["track_id"])
                )

                track = models.Track(
                    id=track["track_id"],
                    name=track["name"],
                    artist=track["artist"],
                    playlist=playlist,
                )
                track.save()

        # Delete unlisted tracks
        for track in old_tracks:
            if not any(track.id == new_track["track_id"] for new_track in new_tracks):
                track.delete()

        playlist.thumbnail = data["thumbnail"]
        playlist.save()

        # Download new tracks if any
        if len(updated_tracks) > 0:
            for track_url in updated_tracks:
                if playlist.platform == "youtube":
                    _download_youtube_track(track_url, file_format, dir_)
                elif playlist.platform == "spotify":
                    _download_spotify_track(track_url, file_format, dir_)

            # Compress folder
            path = shutil.make_archive(str(dir_), "zip", dir_)
            shutil.rmtree(dir_)

            return pathlib.Path(path)

        return None


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


def get_id(link):
    """Get id from YouTube or Spotify link

    Args:
        link (str): link to YouTube or Spotify track or playlist

    Returns:
        str: id of track or playlist
    """
    if "youtube" in link:
        if "playlist" in link:
            return link.split("list=")[1].split("&")[0]
        return link.split("watch?v=")[1].split("&")[0]
    elif "spotify" in link:
        if "playlist" in link:
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
    if platform == "youtube":
        return f"https://www.youtube.com/playlist?list={id_}"
    elif platform == "spotify":
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
    if platform == "youtube":
        return f"https://www.youtube.com/watch?v={id_}"
    elif platform == "spotify":
        return f"https://open.spotify.com/track/{id_}"
    return ""


def _get_youtube_playlist_data(link):
    """Get playlist data from YouTube playlist link

    Args:
        link (str): link to YouTube playlist

    Returns:
        dict: dictionary containing playlist id, name, owner, platform, thumbnail, and tracks ({track_id, name, artist, platform}})
    """
    playlist_id = get_id(link)

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
                    "platform": "youtube",
                }
            )

        if not (pageToken := response.json().get("nextPageToken")):
            break

    data = {
        "playlist_id": playlist_id,
        "name": playlist_name,
        "owner": playlist_owner,
        "platform": "youtube",
        "thumbnail": playlist_thumbnail,
        "tracks": tracks,
    }

    return data


def _get_spotify_track_data(link):
    """Get track data from Spotify track link

    Args:
        link (str): link to Spotify track

    Returns:
        dict: dictionary containing track id, name, artist, and platform
    """
    request_url = "https://api.spotify.com/v1/tracks/"
    track_id = get_id(link)
    response = requests.get(
        request_url + track_id,
        headers=_get_auth_header(_get_token()),
    )
    name = response.json()["name"]
    artist = response.json()["artists"][0]["name"]

    data = {
        "track_id": track_id,
        "name": name,
        "artist": artist,
        "platform": "spotify",
    }

    return data


def _get_spotify_playlist_data(link):
    """Get playlist data from Spotify playlist link

    Args:
        link (str): link to YouTube Spotify

    Returns:
        dict: dictionary containing playlist id, name, owner, platform, thumbnail, and tracks ({track_id, name, artist, platform}})
    """
    request_url = "https://api.spotify.com/v1/playlists/"
    tracks = []
    playlist_id = get_id(link)
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
                "platform": "spotify",
            }
        )

    data = {
        "playlist_id": playlist_id,
        "name": response.json()["name"],
        "owner": response.json()["owner"]["display_name"],
        "platform": "spotify",
        "thumbnail": response.json()["images"][0]["url"],
        "tracks": tracks,
    }

    return data


def log_playlist(playlist_data, update):
    """Log playlist data to database and update if playlist already exists

    Args:
        playlist_data (dict): dictionary containing playlist id, name, owner, platform, thumbnail, and tracks ({track_id, name, artist, platform}})
    """
    playlist_id = playlist_data["playlist_id"]
    playlist_name = playlist_data["name"]
    playlist_owner = playlist_data["owner"]
    playlist_platform = playlist_data["platform"]
    playlist_thumbnail = playlist_data["thumbnail"]
    playlist_tracks = playlist_data["tracks"]

    # Check if playlist already exists
    if models.Playlist.objects.filter(id=playlist_id).exists():
        if update:
            # Update playlist
            playlist = models.Playlist.objects.get(id=playlist_id)
            # Remove removed tracks
            for track in playlist.tracks.all():  # type: ignore
                if track.id not in playlist_tracks:
                    track.delete()
            # Add new tracks
            for track in playlist_tracks:
                if not playlist.tracks.filter(id=track["track_id"]).exists():  # type: ignore
                    track = models.Track(
                        id=track["track_id"],
                        name=track["name"],
                        artist=track["artist"],
                        platform=track["platform"],
                        playlist=playlist,
                    )
                    track.save()
            playlist.save()

        # Playlist already exists
        return True
    else:
        # Create playlist object
        playlist = models.Playlist(
            id=playlist_id,
            name=playlist_name,
            owner=playlist_owner,
            platform=playlist_platform,
            thumbnail=playlist_thumbnail,
        )
        playlist.save()

        # Create track objects
        for track in playlist_tracks:
            track = models.Track(
                id=track["track_id"],
                name=track["name"],
                artist=track["artist"],
                platform=track["platform"],
                playlist=playlist,
            )
            track.save()

        # Playlist doesn't exist
        return False


def _download_youtube_track(link, file_format, dir_):
    """Download YouTube track or playlist from link

    Args:
        link (str): link to YouTube track or playlist
        file_format (str): file format to download tracks in
        dir_ (str): directory to download tracks to
    """
    ydl_opts = {
        "outtmpl": f"{dir_}/%(title)s.%(ext)s",
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
        if name := ydl.extract_info(link, download=True):
            name = name["title"]

    return pathlib.Path.joinpath(dir_, f"{name}.{file_format}")


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
    playlist_dir = pathlib.Path.joinpath(dir_, playlist_name)

    ydl_opts = {
        "outtmpl": f"{playlist_dir}/%(title)s.%(ext)s",
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
    pathlib.Path.joinpath(playlist_dir, f"{playlist_name}.jpg").unlink()

    # Compress folder
    path = shutil.make_archive(str(playlist_dir), "zip", playlist_dir)
    shutil.rmtree(playlist_dir)

    return pathlib.Path(path)


def _download_youtube_search(name, artist, file_format, dir_):
    """Download YouTube track from search query

    Args:
        name (str): track name
        artist (str): artist name
        file_format (str): file format to download track in
        dir_ (str): directory to download tracks to
    """
    ydl_opts = {
        "outtmpl": f"{dir_}/%(title)s.%(ext)s",
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
        "default_search": "https://music.youtube.com/search?q=",
        "playlist_items": "1",
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        if name := ydl.extract_info(f"{name} {artist}", download=True):
            name = name["entries"][0]["title"]

    return pathlib.Path.joinpath(dir_, f"{name}.{file_format}")


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
    playlist_dir = pathlib.Path.joinpath(dir_, playlist_name)

    tracks = data["tracks"]
    for track in tracks:
        _download_youtube_search(
            track["name"], track["artist"], file_format, playlist_dir
        )

    # Compress folder
    path = shutil.make_archive(str(playlist_dir), "zip", playlist_dir)
    shutil.rmtree(playlist_dir)

    return pathlib.Path(path)
