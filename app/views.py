from django.shortcuts import render, redirect
from django.http import FileResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .util import (
    download_music,
    get_playlist_link,
    log_playlist,
    get_id,
    get_playlist_data,
    update_playlist,
    DEFAULT_FILE_FORMAT,
)
from . import models


# Create your views here.
def index(request):
    return render(request, "app/index.html")


@csrf_exempt
def brew(request, playlist_id=None):
    if request.method == "PUT":
        data = json.loads(request.body)
        link = data.get("link")
        file_format = data.get("fileFormat")

    else:
        playlist = models.Playlist.objects.get(id=playlist_id)
        link = get_playlist_link(playlist.platform, playlist.id)
        file_format = DEFAULT_FILE_FORMAT

    try:
        download_data = download_music(link, file_format)
    except (KeyError, IndexError):
        return JsonResponse(
            {"error": True, "message": "Invalid YouTube/Spotify link"}, status=400
        )

    if download_data:
        return JsonResponse(
            {
                "error": False,
                "message": "Responded with file path",
                "model": models.Playlist.objects.get(id=get_id(link)).serialize()
                if download_data["is_playlist"]
                else None,
                "path": str(download_data["path"]),
                "name": download_data["path"].name,
                "exists": download_data["exists"],
            },
            status=200,
        )

    return JsonResponse(
        {"error": True, "message": "Invalid YouTube/Spotify link"}, status=400
    )


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
    except FileNotFoundError as e:
        print(e)
        return JsonResponse({"error": True, "message": "File not found"}, status=404)


def get_playlists(request):
    playlists = models.Playlist.objects.all().order_by("last_modified")
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
    return JsonResponse(
        {"error": error, "message": "Playlist does not exist"}, status=status
    )


def remove(request, playlist_id):
    try:
        models.Playlist.objects.get(id=playlist_id).delete()
        error = False
        status = 200
    except:
        error = True
        status = 400
    return JsonResponse(
        {"error": error, "message": "Playlist does not exist"}, status=status
    )


def playlist(request, playlist_platform, playlist_id):
    id_ = models.Playlist.objects.get(id=playlist_id).id
    link = get_playlist_link(playlist_platform, id_)
    return redirect(link)


@csrf_exempt
def watch(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        link = data.get("link")

        if "list" not in link:
            return JsonResponse(
                {"error": True, "message": "Link must be playlist"}, status=400
            )

        platform = None
        if "youtube" or "youtu.be" in link:
            platform = "youtube"
        elif "spotify" in link:
            platform = "spotify"

        try:
            exists = log_playlist(get_playlist_data(link, platform), False)
        except (KeyError, IndexError):
            return JsonResponse(
                {"error": True, "message": "Invalid playlist link"}, status=400
            )

        return JsonResponse(
            {
                "error": False,
                "message": "Playlist saved",
                "exists": exists,
                "data": models.Playlist.objects.get(id=get_id(link)).serialize(),
            },
            status=200,
        )
    return JsonResponse(
        {"error": True, "message": "Request method must be PUT"}, status=400
    )
