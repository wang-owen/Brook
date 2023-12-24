import os
import base64
import subprocess
import requests
from dotenv import load_dotenv

# Load API keys from .env file
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

# Set download directory
DIR = os.path.join("Music")
if DIR not in os.listdir():
    os.mkdir(DIR)


def download_spotify_song(link, file_format):
    name, artist = get_spotify_song(link)
    subprocess.call(
        [
            "yt-dlp",
            "-o",
            f"{DIR}/%(title)s.%(ext)s",
            "-f",
            f"ba[ext={file_format}]",
            "--embed-thumbnail",
            "--add-metadata",
            "--default-search",
            "https://music.youtube.com/search?q=",
            f"{name} {artist}",
            "--playlist-items",
            "1",
        ]
    )
    subprocess.call(["open", DIR])


def download_spotify_playlist(link, file_format):
    tracks = get_spotify_playlist(link)
    for name, artist in tracks:
        # Search each song on YouTube Music and download first result
        subprocess.call(
            [
                "yt-dlp",
                "-o",
                f"{DIR}/%(title)s.%(ext)s",
                "-f",
                f"ba[ext={file_format}]",
                "--embed-thumbnail",
                "--add-metadata",
                "--default-search",
                "https://music.youtube.com/search?q=",
                f"{name} {artist}",
                "--playlist-items",
                "1",
            ]
        )
    subprocess.call(["open", DIR])


def download_youtube(link, file_format):
    # Download YouTube playlist
    subprocess.call(
        [
            "yt-dlp",
            "-o",
            f"{DIR}/%(title)s.%(ext)s",
            "-f",
            f"ba[ext={file_format}]",
            "--embed-thumbnail",
            "--add-metadata",
            link,
        ]
    )

    # Open download directory
    subprocess.call(["open", DIR])


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


def get_spotify_song(link):
    """Get song name from Spotify track link"""
    request_url = "https://api.spotify.com/v1/tracks/"
    track_id = link.split("track/")[1].split("?")[0]
    response = requests.get(
        request_url + track_id,
        headers=_get_auth_header(_get_token()),
    )
    name = response.json()["name"]
    artist = response.json()["artists"][0]["name"]

    return [name, artist]


def get_spotify_playlist(link):
    """Get list of [name, artist] from Spotify playlist link"""
    request_url = "https://api.spotify.com/v1/playlists/"
    tracks = []
    playlist_id = link.split("playlist/")[1].split("?")[0]
    response = requests.get(
        request_url + playlist_id + "/tracks",
        headers=_get_auth_header(_get_token()),
    )

    # Add each song name and artist to list
    for item in response.json()["items"]:
        name = item["track"]["name"]
        artist = item["track"]["artists"][0]["name"]
        tracks.append([name, artist])

    return tracks


def get_youtube_playlist(link):
    """Get list of [name, artist] from YouTube playlist link"""
    request_url = "https://www.googleapis.com/youtube/v3/playlistItems"
    tracks = []
    playlist_id = link.split("list=")[1].split("&")[0]

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

    return tracks
