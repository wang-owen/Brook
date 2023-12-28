from django.shortcuts import render, redirect
from django.http import FileResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
import json
from .util import (
    download_music,
    get_playlist_link,
    log_playlist,
    get_playlist_data,
    update_playlist,
    DEFAULT_FILE_FORMAT,
)
from . import models
from django.views.decorators.csrf import csrf_exempt


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


@csrf_exempt
def brew(request, playlist_id=None):
    if request.method == "PUT":
        data = json.loads(request.body)
        link = data.get("link")
        file_format = data.get("file_format")

    else:
        playlist = models.Playlist.objects.get(id=playlist_id)
        link = get_playlist_link(playlist.platform, playlist.id)
        file_format = DEFAULT_FILE_FORMAT

    try:
        path = download_music(link, file_format)
    except (KeyError, IndexError):
        return JsonResponse({"error": "Invalid link"}, status=400)

    if path:
        return JsonResponse({"name": path.name, "path": str(path)}, status=200)

    return JsonResponse({"error": "Invalid link"}, status=400)


def download(request, name, path):
    try:
        if "zip" in path:
            content_type = "application/zip"
        else:
            file_format = path.split(".")[-1]
            content_type = f"audio/{file_format}"
        response = FileResponse(
            open(path, "rb"), as_attachment=True, content_type=content_type
        )
        response["Content-Disposition"] = f"attachment; filename={name}"
        return response
    except FileNotFoundError:
        request.session["error"] = "Invalid link"
        return HttpResponseRedirect(reverse("index"))


def playlists(request):
    playlists = models.Playlist.objects.all().order_by("-last_modified")
    return JsonResponse(
        [playlist.serialize() for playlist in playlists], safe=False, status=200
    )


def update(request, playlist_id):
    try:
        update_playlist(playlist_id, DEFAULT_FILE_FORMAT)
        error = False
        status = 200
    except:
        error = True
        status = 400
    return JsonResponse({"error": error}, status=status)


def remove(request, playlist_id):
    try:
        models.Playlist.objects.get(id=playlist_id).delete()
        error = False
        status = 200
    except:
        error = True
        status = 400
    return JsonResponse({"error": error}, status=status)


def playlist(request, playlist_platform, playlist_id):
    id_ = models.Playlist.objects.get(id=playlist_id).id
    link = get_playlist_link(playlist_platform, id_)
    return redirect(link)


@csrf_exempt
def watch(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        link = data.get("link")
        print()
        print(link)
        print()

        if "list" not in link:
            return JsonResponse({"error": "Must be playlist"}, status=400)

        platform = None
        if "youtube" or "youtu.be" in link:
            platform = "youtube"
        elif "spotify" in link:
            platform = "spotify"

        try:
            log_playlist(get_playlist_data(link, platform))
        except (KeyError, IndexError):
            return JsonResponse({"error": "Invalid link"}, status=400)

        return JsonResponse({"error": False}, status=200)
    return JsonResponse({"error": "Invalid request"}, status=400)
