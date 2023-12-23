from django.http import HttpResponseRedirect
from django.shortcuts import render
from django import forms
import subprocess

from django.urls import reverse


# Create your views here.
def index(request):
    return render(request, "app/index.html", {"form": linkForm()})


class linkForm(forms.Form):
    link = forms.CharField(
        widget=forms.TextInput(
            attrs={"placeholder": "https://www.youtube.com/playlist?list="}
        ),
        max_length=150,
    )


def scrape(request):
    if request.method == "POST":
        form = linkForm(request.POST)
        if form.is_valid():
            link = form.cleaned_data["link"]
            if "youtube" in link:
                download(link, "youtube")
            elif "spotify" in link:
                download(link, "spotify")
    return HttpResponseRedirect(reverse("index"))


def download(link, platform):
    subprocess.call(
        [
            "yt-dlp",
            "-o",
            "%(title)s.%(ext)s",
            "-f",
            "ba[ext=m4a]",
            "--embed-thumbnail",
            "--add-metadata",
            link,
        ]
    )
