import os
import base64
import shutil
import subprocess
import requests
import yt_dlp
from dotenv import load_dotenv
from . import models

# Load API keys from .env file
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

# Set download directory
DIR = os.path.join("Music")


def download_music(link, file_format):
    if DIR not in os.listdir():
        os.mkdir(DIR)

    error = False
    is_playlist = False
    platform = None
    if "playlist" in link:
        is_playlist = True

    if "youtube" in link:
        platform = "youtube"
        if is_playlist:
            error = _download_youtube_playlist(link, file_format)
        else:
            _download_youtube_track(link, file_format)
    elif "spotify" in link:
        platform = "spotify"
        if is_playlist:
            error = _download_spotify_playlist(link, file_format)
        else:
            _download_spotify_track(link, file_format)
    else:
        return False

    if not error and is_playlist:
        _log_playlist(link, platform)

    return error


def _get_playlist_data(link, platform):
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


def _get_id(link):
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
        # return f"https://www.youtube.com/watch?v={id_}"
    elif platform == "spotify":
        return f"https://open.spotify.com/playlist/{id_}"
        # return f"https://open.spotify.com/track/{id_}"
    return ""


def _get_youtube_playlist_data(link):
    """Get playlist data from YouTube playlist link

    Args:
        link (str): link to YouTube playlist

    Returns:
        dict: dictionary containing playlist link, title, owner, thumbnail, and tracks ([name, artist]])
    """
    playlist_id = _get_id(link)

    # Get playlist title, owner, and thumbnail from different API endpoint
    response = requests.get(
        "https://www.googleapis.com/youtube/v3/playlists",
        params={
            "part": "snippet",
            "id": playlist_id,
            "key": YOUTUBE_API_KEY,
        },
    )
    try:
        playlist_name = response.json()["items"][0]["snippet"]["title"]
        playlist_owner = response.json()["items"][0]["snippet"]["channelTitle"]
        playlist_thumbnail = response.json()["items"][0]["snippet"]["thumbnails"][
            "standard"
        ]["url"]
    except IndexError or KeyError:
        print("Invalid YouTube playlist link")
        return {}

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
                }
            )

        if not (pageToken := response.json().get("nextPageToken")):
            break

    data = {
        "playlist_id": playlist_id,
        "name": playlist_name,
        "owner": playlist_owner,
        "thumbnail": playlist_thumbnail,
        "tracks": tracks,
    }

    return data


def _get_spotify_track_data(link):
    """Get track data from Spotify track link

    Args:
        link (str): link to Spotify track

    Returns:
        dict: dictionary containing track id, name, and artist
    """
    request_url = "https://api.spotify.com/v1/tracks/"
    track_id = _get_id(link)
    try:
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
        }
    except KeyError:
        print("Invalid Spotify track link")
        data = {}

    return data


def _get_spotify_playlist_data(link):
    """Get playlist data from Spotify playlist link

    Args:
        link (str): link to Spotify playlist

    Returns:
        dict: dictionary containing playlist id, link, title, owner, thumbnail, and tracks ([name, artist]])
    """
    request_url = "https://api.spotify.com/v1/playlists/"
    tracks = []
    playlist_id = _get_id(link)
    response = requests.get(
        request_url + playlist_id,
        headers=_get_auth_header(_get_token()),
    )

    # Add each track name and artist to list
    try:
        for item in response.json()["tracks"]["items"]:
            name = item["track"]["name"]
            artist = item["track"]["artists"][0]["name"]
            tracks.append(
                {
                    "track_id": item["track"]["id"],
                    "name": name,
                    "artist": artist,
                }
            )

        data = {
            "playlist_id": playlist_id,
            "name": response.json()["name"],
            "owner": response.json()["owner"]["display_name"],
            "thumbnail": response.json()["images"][0]["url"],
            "tracks": tracks,
        }
    except KeyError:
        print("Invalid Spotify playlist link")
        data = {}

    return data


def _log_playlist(link, platform):
    """Log playlist data to database and update if playlist already exists

    Args:
        playlist_data (dict): dictionary containing playlist title, owner, thumbnail, and tracks ([name, artist]])
    """
    playlist_data = _get_playlist_data(link, platform)
    playlist_id = playlist_data["playlist_id"]
    playlist_name = playlist_data["name"]
    playlist_owner = playlist_data["owner"]
    playlist_thumbnail = playlist_data["thumbnail"]
    playlist_tracks = playlist_data["tracks"]

    # Check if playlist already exists
    if models.Playlist.objects.filter(id=playlist_id).exists():
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
                    playlist=playlist,
                )
                track.save()
    else:
        # Create playlist object
        playlist = models.Playlist(
            id=playlist_id,
            name=playlist_name,
            owner=playlist_owner,
            platform=platform,
            thumbnail=playlist_thumbnail,
        )
        playlist.save()

        # Create track objects
        for track in playlist_tracks:
            track = models.Track(
                id=track["track_id"],
                name=track["name"],
                artist=track["artist"],
                playlist=playlist,
            )
            track.save()


def _download_youtube_track(link, file_format):
    """Download YouTube track or playlist from link

    Args:
        link (str): link to YouTube track or playlist
        file_format (str): file format to download tracks in
    """
    ydl_opts = {
        "outtmpl": f"{DIR}/%(title)s.%(ext)s",
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
    subprocess.call(["open", DIR])


def _download_youtube_playlist(link, file_format):
    """Download YouTube track or playlist from link

    Args:
        link (str): link to YouTube track or playlist
        file_format (str): file format to download tracks in
    """
    data = _get_youtube_playlist_data(link)

    # If playlist is invalid
    if len(data) == 0:
        return True

    playlist_name = data["name"]
    playlist_owner = data["owner"]

    # Set download directory
    dir_ = os.path.join(f"{playlist_name} - {playlist_owner}")
    if dir_ in os.listdir(DIR):
        shutil.rmtree(os.path.join(DIR, dir_))
    dir_ = os.path.join(DIR, dir_)
    os.mkdir(os.path.join(dir_))

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
        ydl.download([link])

    os.remove(os.path.join(dir_, f"{playlist_name}.jpg"))

    subprocess.call(["open", dir_])
    return False


def __download_youtube_search(name, artist, file_format, dir_=DIR):
    """Download YouTube track from search query

    Args:
        name (str): track name
        artist (str): artist name
        file_format (str): file format to download track in
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
        ydl.download([f"{name} {artist}"])


def _download_spotify_track(link, file_format):
    """Download Spotify track from link

    Args:
        link (str): link to Spotify track
        file_format (str): file format to download track in
    """
    track_name, track_artist = _get_spotify_track_data(link).values()
    __download_youtube_search(track_name, track_artist, file_format)
    subprocess.call(["open", DIR])  # open folder after download


def _download_spotify_playlist(link, file_format):
    """Download Spotify playlist from link

    Args:
        link (str): link to Spotify playlist
        file_format (str): file format to download tracks in
    """
    data = _get_spotify_playlist_data(link)
    try:
        playlist_name = data["name"]
        playlist_owner = data["owner"]
    except KeyError:
        return True

    # Set download directory
    dir_ = os.path.join(f"{playlist_name} - {playlist_owner}")
    if dir_ in os.listdir(DIR):
        shutil.rmtree(os.path.join(DIR, dir_))
    dir_ = os.path.join(DIR, dir_)
    os.mkdir(os.path.join(dir_))

    tracks = data["tracks"]
    for track in tracks:
        __download_youtube_search(track["name"], track["artist"], file_format, dir_)
    subprocess.call(["open", dir_])  # open folder after download
    return False
