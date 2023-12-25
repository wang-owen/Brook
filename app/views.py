from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django import forms
from .util import download_music
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
    result = None
    if request.method == "POST":
        form = forms.linkForm(request.POST)
        if form.is_valid():
            link = form.cleaned_data["link"]
            file_format = form.cleaned_data["file_format"]

            result = download_music(link, file_format)

    return render(
        request,
        "app/index.html",
        {
            "form": forms.linkForm(),
            "playlists": models.Playlist.objects.all(),
            "result": result,
        },
    )
