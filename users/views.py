from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from pathlib import Path
from shutil import rmtree


# Create your views here.
def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "users/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = get_user_model().objects.create_user(username, email, password)  # type: ignore
            user.save()
        except IntegrityError:
            return render(
                request,
                "users/register.html",
                {"message": "Username already taken."},
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "users/register.html")


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "users/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "users/login.html")


@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


@login_required
def clear_files(request):
    # Only allow superusers to access page
    if request.user.is_superuser:
        if request.method == "PUT":
            # Delete all files in the music directory
            if Path(settings.MUSIC_DIR).exists():
                rmtree(settings.MUSIC_DIR)
        else:
            files = []
            for folder in Path(settings.MUSIC_DIR).iterdir():
                for file in folder.iterdir():
                    if folder.name not in ["Playlists", "Tracks"]:
                        files.append(file.name)

            playlists = []
            for folder in Path.joinpath(settings.MUSIC_DIR, "Playlists").iterdir():
                for playlist in folder.iterdir():
                    playlists.append(playlist.name)
            tracks = []
            for folder in Path.joinpath(settings.MUSIC_DIR, "Tracks").iterdir():
                for track in folder.iterdir():
                    tracks.append(track.name)

            return render(
                request,
                "users/clear_files.html",
                {
                    "files": files,
                    "playlists": playlists,
                    "tracks": tracks,
                },
            )
    return HttpResponseRedirect(reverse("index"))
