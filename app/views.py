from django.shortcuts import render, redirect
from django.http import FileResponse, HttpResponseRedirect
from django.urls import reverse
from .util import (
    download_music,
    get_playlist_link,
    update_playlist,
    clear_files,
    DEFAULT_FILE_FORMAT,
)
from . import models


# Create your views here.
def index(request):
    error = (
        request.session["error"]
        if "error" in request.session and request.session["error"]
        else ""
    )
    request.session["error"] = False
    return render(
        request,
        "app/index.html",
        {
            "playlists": models.Playlist.objects.all().order_by("-last_modified"),
            "error": error,
        },
    )


def download(request, playlist_id=None):
    request.session["error"] = ""

    path = None
    # If given playlist link
    if request.method == "POST":
        link = request.POST["link"]
        file_format = request.POST["file_format"]
    else:
        playlist = models.Playlist.objects.get(id=playlist_id)
        link = get_playlist_link(playlist.platform, playlist.id)
        file_format = DEFAULT_FILE_FORMAT

    try:
        path = download_music(link, file_format)
        request.session["error"] = ""
    except (KeyError, IndexError) as e:
        print(e)
        request.session["error"] = "Invalid link"

    if path:
        response = FileResponse(open(path, "rb"))
        response["Content-Disposition"] = f"attachment; filename={path.name}"
        return response

    request.session["error"] = "Invalid link"
    return HttpResponseRedirect(reverse("index"))


def update(request, playlist_id):
    try:
        update_playlist(playlist_id, DEFAULT_FILE_FORMAT)
        request.session["error"] = ""
    except:
        request.session["error"] = "Invalid playlist"
    return HttpResponseRedirect(reverse("index"))


def remove(request, playlist_id):
    try:
        models.Playlist.objects.get(id=playlist_id).delete()
        request.session["error"] = ""
    except:
        request.session["error"] = "Invalid playlist"
    return HttpResponseRedirect(reverse("index"))


def playlist(request, playlist_platform, playlist_id):
    id_ = models.Playlist.objects.get(id=playlist_id).id
    link = get_playlist_link(playlist_platform, id_)
    return redirect(link)
