from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect
from django.urls import reverse
from django import forms
from .util import download_music, get_playlist_link
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
            "error": request.session["error"] if "error" in request.session else False,
        },
    )


def download(request):
    error = False
    if request.method == "POST":
        form = forms.linkForm(request.POST)
        if form.is_valid():
            link = form.cleaned_data["link"]
            file_format = form.cleaned_data["file_format"]

            request.session["error"] = download_music(link, file_format)

    return HttpResponseRedirect(
        reverse(
            "index",
        )
    )


def playlist(request, playlist_platform, playlist_id):
    id_ = models.Playlist.objects.get(id=playlist_id).id
    link = get_playlist_link(playlist_platform, id_)
    return redirect(link)
