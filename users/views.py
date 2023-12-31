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
    # Only allow superusers to clear files
    if request.user.is_superuser:
        # Delete all files in the music directory
        if Path(settings.MUSIC_DIR).exists():
            rmtree(settings.MUSIC_DIR)
    return HttpResponseRedirect(reverse("index"))
