from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django import forms
from . import util
from . import models
from . import forms


# Create your views here.
def index(request):
    return render(
        request,
        "app/index.html",
        {
            "form": forms.linkForm(),
            "playlists": models.Playlist.objects.all(),
        },
    )


def download(request):
    if request.method == "POST":
        form = forms.linkForm(request.POST)
        if form.is_valid():
            link = form.cleaned_data["link"]
            file_format = form.cleaned_data["file_format"]

            is_playlist = False
            platform = None
            if "playlist" in link:
                is_playlist = True

            if "youtube" in link:
                platform = "youtube"
                util.download_youtube(link, file_format)
            elif "spotify" in link:
                platform = "spotify"
                if is_playlist:
                    util.download_spotify_playlist(link, file_format)
                else:
                    util.download_spotify_song(link, file_format)

            if is_playlist:
                util.log_playlist(link, platform)

    return HttpResponseRedirect(reverse("index"))
