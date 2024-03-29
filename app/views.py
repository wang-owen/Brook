from django.shortcuts import render, redirect
from django.http import FileResponse, JsonResponse
from django.contrib.auth.decorators import login_required
import json
from . import util
from . import models


# Create your views here.
def index(request):
    return render(request, "app/index.html")


def about(request):
    return render(request, "app/about.html")


def check_login(request):
    if request.method == "GET":
        return JsonResponse({"logged_in": request.user.is_authenticated}, status=200)
    return JsonResponse(
        {"error": True, "message": "Request method must be GET"}, status=400
    )


def brew(request, playlist_id=None):
    if request.method == "PUT":
        # Get playlist link from request body
        data = json.loads(request.body)
        link = data.get("link")
        file_format = data.get("fileFormat")
    else:
        # Get playlist link from database
        playlist = models.Playlist.objects.get(playlist_id=playlist_id)
        link = util.get_playlist_link(playlist.platform, playlist.playlist_id)
        file_format = util.DEFAULT_FILE_FORMAT

    try:
        # Download music
        download_data = util.download_music(
            link, file_format, request.user.is_authenticated, request.user
        )
    except (KeyError, IndexError):
        # Invalid YouTube/Spotify link
        return JsonResponse(
            {"error": True, "message": "Invalid YouTube/Spotify link"}, status=400
        )

    if download_data:
        # Return JSON response to client, handled by brew() in index.js
        return JsonResponse(
            {
                "error": False,
                "message": "Responded with file path",
                "is_playlist": download_data["is_playlist"],
                "model": (
                    models.Playlist.objects.get(
                        playlist_id=util.get_id(link)
                    ).serialize()
                    if request.user.is_authenticated and download_data["is_playlist"]
                    else None
                ),
                "exists": download_data["exists"],
                "path": str(download_data["path"]),
                "message": (
                    "Playlist downloaded"
                    if download_data["is_playlist"]
                    else "Track downloaded"
                ),
            },
            status=200,
        )

    # download data is empty
    return JsonResponse(
        {"error": True, "message": "Invalid YouTube/Spotify link"}, status=400
    )


def download(request, path):
    # Return file to client, called by brew() in index.js
    try:
        # Determine whether file is a zip or audio file
        if "zip" in path:
            content_type = "application/zip"
        else:
            content_type = f"audio/{path.split('.')[-1]}"

        # Return file to client
        response = FileResponse(
            open(path, "rb"), as_attachment=True, content_type=content_type
        )
        response["Content-Disposition"] = f"attachment; filename={path.split('/')[-1]}"
        return response
    except FileNotFoundError as e:
        print(e)
        return JsonResponse({"error": True, "message": "File not found"}, status=404)


def get_playlists(request):
    # Return all playlists to client, called by loadPlaylists() in index.js
    playlists = models.Playlist.objects.filter(watcher=request.user).order_by(
        "last_modified"
    )
    return JsonResponse(
        [playlist.serialize() for playlist in playlists], safe=False, status=200
    )


@login_required
def update(request, playlist_id):
    # Update playlist in database, called when update button is clicked; handled by brew() in index.js
    try:
        path = util.update_playlist(playlist_id, util.DEFAULT_FILE_FORMAT, request.user)
        print(path)
        if path:
            return JsonResponse(
                {
                    "error": False,
                    "message": "Playlist updated, new tracks downloaded",
                    "path": str(path),
                    "name": path.name,
                    "thumbnail": models.Playlist.objects.get(
                        watcher=request.user, playlist_id=playlist_id
                    ).thumbnail,
                },
                status=200,
            )
        # No new tracks downloaded
        return JsonResponse(
            {
                "error": False,
                "message": "Playlist updated",
                "thumbnail": models.Playlist.objects.get(
                    watcher=request.user, playlist_id=playlist_id
                ).thumbnail,
            },
            status=200,
        )
    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": True, "message": "Playlist does not exist"}, status=400
        )


@login_required
def remove(request, playlist_id):
    try:
        # Delete playlist from database
        models.Playlist.objects.get(playlist_id=playlist_id).delete()
        error = False
        status = 200
    except:
        error = True
        status = 400
    return JsonResponse(
        {"error": error, "message": "Playlist does not exist"}, status=status
    )


def playlist(request, playlist_platform, playlist_id):
    id_ = models.Playlist.objects.get(playlist_id=playlist_id).playlist_id
    link = util.get_playlist_link(playlist_platform, id_)
    return redirect(link)


def watch(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        link = data.get("link")

        if "list" not in link:
            return JsonResponse(
                {"error": True, "message": "Link must be playlist"}, status=400
            )

        platform = None
        if "youtube" in link or "youtu.be" in link:
            platform = "youtube"
        elif "spotify" in link:
            platform = "spotify"

        if platform:
            try:
                exists = util.log_playlist(
                    util.get_playlist_data(link, platform),
                    update=False,
                    user_model=request.user,
                )
            except (KeyError, IndexError):
                return JsonResponse(
                    {"error": True, "message": "Invalid playlist link"}, status=400
                )

            return JsonResponse(
                {
                    "error": False,
                    "message": "Playlist saved",
                    "exists": exists,
                    "data": models.Playlist.objects.get(
                        playlist_id=util.get_id(link)
                    ).serialize(),
                },
                status=200,
            )
    return JsonResponse(
        {"error": True, "message": "Request method must be PUT"}, status=400
    )
