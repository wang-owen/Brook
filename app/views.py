from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django import forms
import os
import base64
import subprocess
import requests
from dotenv import load_dotenv
import time

load_dotenv()
client_id = os.getenv("SPOTIFY_CLIENT_ID")
client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")

DIR = os.path.join("Music")


# Create your views here.
def index(request):
    return render(request, "app/index.html", {"form": linkForm()})


class linkForm(forms.Form):
    link = forms.CharField(
        widget=forms.TextInput(
            attrs={"placeholder": "https://www.youtube.com/playlist?list="}
        ),
        max_length=200,
    )
    format = forms.ChoiceField(
        choices=[
            ("m4a", "m4a"),
        ],
        widget=forms.Select(),
    )


def download(request):
    if request.method == "POST":
        form = linkForm(request.POST)
        if form.is_valid():
            link = form.cleaned_data["link"]
            format = form.cleaned_data["format"]
            run_cmd(link, format)
    return HttpResponseRedirect(reverse("index"))


def run_cmd(link, format):
    if "spotify" in link:
        tracks = get_spotify_playlist(link)
        for name, artist in tracks:
            subprocess.call(
                [
                    "yt-dlp",
                    "-o",
                    f"{DIR}/%(title)s.%(ext)s",
                    "-f",
                    f"ba[ext={format}]",
                    "--embed-thumbnail",
                    "--add-metadata",
                    "--default-search",
                    "https://music.youtube.com/search?q=",
                    f"{name} {artist}",
                    "--playlist-items",
                    "1",
                ]
            )
    else:
        subprocess.call(
            [
                "yt-dlp",
                "-o",
                f"{DIR}/%(title)s.%(ext)s",
                "-f",
                f"ba[ext={format}]",
                "--embed-thumbnail",
                "--add-metadata",
                link,
            ]
        )
    subprocess.call(["open", DIR])


def get_token():
    auth_string = client_id + ":" + client_secret  # type: ignore
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


def get_spotify_playlist(link):
    tracks = []
    playlist_id = link.split("playlist/")[1].split("?")[0]
    response = requests.get(
        "https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks",
        headers=get_auth_header(get_token()),
    )

    for item in response.json()["items"]:
        tracks.append([item["track"]["name"], item["track"]["artists"][0]["name"]])

    return tracks


def get_youtube_playlist(link):
    tracks = []
    playlist_id = link.split("list=")[1].split("&")[0]

    response = requests.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        params={
            "part": "snippet",
            "maxResults": 50,
            "playlistId": playlist_id,
            "key": os.getenv("YOUTUBE_API_KEY"),
        },
    )

    if "nextPageToken" in response.json():
        while True:
            for item in response.json()["items"]:
                tracks.append(
                    [
                        item["snippet"]["title"],
                        item["snippet"]["videoOwnerChannelTitle"].split(" - ")[0],
                    ]
                )

            try:
                response = requests.get(
                    "https://www.googleapis.com/youtube/v3/playlistItems",
                    params={
                        "part": "snippet",
                        "pageToken": response.json()["nextPageToken"],
                        "maxResults": 50,
                        "playlistId": playlist_id,
                        "key": os.getenv("YOUTUBE_API_KEY"),
                    },
                )
            except KeyError:
                break

    return tracks
