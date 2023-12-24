import os
import base64
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
if DIR not in os.listdir():
    os.mkdir(DIR)


def log_playlist(link, platform):
    """Log playlist data to database

    Args:
        playlist_data (dict): dictionary containing playlist title, owner, thumbnails, and tracks ([name, artist]])
    """
    playlist_data = _get_playlist_data(link, platform)
    title = playlist_data["title"]
    owner = playlist_data["owner"]
    thumbnails = playlist_data["thumbnails"]
    tracks = playlist_data["tracks"]

    # Check if playlist already exists
    if models.Playlist.objects.filter(title=title, owner=owner).exists():
        _update_playlist(playlist_data)
    else:
        # Create playlist object
        playlist = models.Playlist(
            title=title,
            owner=owner,
            platform=platform,
            link=link,
            thumbnail=thumbnails["url"],
        )
        playlist.save()

        # Create song objects
        for name, artist in tracks:
            song = models.Song(
                name=name,
                artist=artist,
                playlist=playlist,
            )
            song.save()


def _update_playlist(playlist_data):
    playlist = models.Playlist.objects.get(
        title=playlist_data["title"], owner=playlist_data["owner"]
    )
    tracks = playlist_data["tracks"]

    for song in playlist.songs.all():  # type: ignore
        if [song.name, song.artist] not in tracks:
            song.delete()
    for name, artist in tracks:
        if not playlist.songs.filter(name=name, artist=artist).exists():  # type: ignore
            song = models.Song(
                name=name,
                artist=artist,
                playlist=playlist,
            )
            song.save()


def _get_playlist_data(link, platform):
    """Return song name and artist for each track in playlist

    Args:
        link (str): link to playlist
        platform (str): playlist platform (spotify or youtube)
    """
    if platform == "youtube":
        return _get_youtube_playlist_data(link)
    elif platform == "spotify":
        return _get_spotify_playlist_data(link)
    return {}


def download_spotify_song(link, file_format):
    """Download Spotify song from link

    Args:
        link (str): link to Spotify song
        file_format (str): file format to download song in
    """
    name, artist = _get_spotify_song_data(link).values()
    _download_youtube_search(name, artist, file_format)
    subprocess.call(["open", DIR])  # open folder after download


def download_spotify_playlist(link, file_format):
    """Download Spotify playlist from link

    Args:
        link (str): link to Spotify playlist
        file_format (str): file format to download songs in
    """
    tracks = _get_spotify_playlist_data(link)["tracks"]
    for name, artist in tracks:
        _download_youtube_search(name, artist, file_format)
    subprocess.call(["open", DIR])  # open folder after download


def download_youtube(link, file_format):
    """Download YouTube song or playlist from link

    Args:
        link (str): link to YouTube song or playlist
        file_format (str): file format to download songs in
    """
    ydl_opts = {
        "outtmpl": f"{DIR}/%(title)s.%(ext)s",
        "format": f"ba[ext={file_format}]",
        "writethumbnail": True,
        "writedescription": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([link])
    subprocess.call(["open", DIR])


def _download_youtube_search(name, artist, file_format):
    """Download YouTube song from search query

    Args:
        name (str): song name
        artist (str): artist name
        file_format (str): file format to download song in
    """
    ydl_opts = {
        "outtmpl": f"{DIR}/%(title)s.%(ext)s",
        "format": f"ba[ext={file_format}]",
        "writethumbnail": True,
        "writedescription": True,
        "default_search": "https://music.youtube.com/search?q=",
        "playlist_items": "1",
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([f"{name} {artist}"])


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


def _get_spotify_song_data(link):
    """Get song name and artist from Spotify song link

    Args:
        link (str): link to Spotify song

    Returns:
        dict: dictionary containing song name and artist
    """
    request_url = "https://api.spotify.com/v1/tracks/"
    track_id = link.split("track/")[1].split("?")[0]
    response = requests.get(
        request_url + track_id,
        headers=_get_auth_header(_get_token()),
    )
    name = response.json()["name"]
    artist = response.json()["artists"][0]["name"]

    data = {
        "name": name,
        "artist": artist,
    }

    return data


def _get_spotify_playlist_data(link):
    """Get playlist title, owner, thumbnails, and tracks of playlist

    Args:
        link (str): link to Spotify playlist

    Returns:
        dict: dictionary containing playlist title, owner, thumbnails, and tracks ([name, artist]])
    """
    request_url = "https://api.spotify.com/v1/playlists/"
    tracks = []
    playlist_id = link.split("playlist/")[1].split("?")[0]
    response = requests.get(
        request_url + playlist_id,
        headers=_get_auth_header(_get_token()),
    )

    # Add each song name and artist to list
    for item in response.json()["tracks"]["items"]:
        name = item["track"]["name"]
        artist = item["track"]["artists"][0]["name"]
        tracks.append([name, artist])

    data = {
        "title": response.json()["name"],
        "owner": response.json()["owner"]["display_name"],
        "thumbnails": response.json()["images"],
        "tracks": tracks,
    }

    return data


def _get_youtube_playlist_data(link):
    """Get playlist title, owner, thumbnails, and tracks of playlist

    Args:
        link (str): link to YouTube playlist

    Returns:
        dict: dictionary containing playlist title, owner, thumbnails, and tracks ([name, artist]])
    """
    playlist_id = link.split("list=")[1].split("&")[0]

    # Get playlist title, owner, and thumbnails from different API endpoint
    response = requests.get(
        "https://www.googleapis.com/youtube/v3/playlists",
        params={
            "part": "snippet",
            "id": playlist_id,
            "key": YOUTUBE_API_KEY,
        },
    )
    title = response.json()["items"][0]["snippet"]["title"]
    owner = response.json()["items"][0]["snippet"]["channelTitle"]
    thumbnails = response.json()["items"][0]["snippet"]["thumbnails"]["standard"]

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

        # Add each song name and artist to list
        for item in response.json()["items"]:
            name = item["snippet"]["title"]
            artist = item["snippet"]["videoOwnerChannelTitle"].split(" - ")[0]
            tracks.append([name, artist])

        if not (pageToken := response.json().get("nextPageToken")):
            break

    data = {
        "title": title,
        "owner": owner,
        "thumbnails": thumbnails,
        "tracks": tracks,
    }

    return data
