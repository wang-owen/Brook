from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from pathlib import Path
from shutil import rmtree


# Create your views here.
@login_required
def clear_files(request):
    # Only allow superusers to clear files
    if request.user.is_superuser:
        # Delete all files in the music directory
        if Path(settings.MUSIC_DIR).exists():
            rmtree(settings.MUSIC_DIR)
    return HttpResponseRedirect(reverse("index"))


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))
