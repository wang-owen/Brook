from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django import forms
from . import util


# Create your views here.
def index(request):
    return render(request, "app/index.html", {"form": linkForm()})


class linkForm(forms.Form):
    link = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "placeholder": "YouTube or Spotify song/playlist link",
                "id": "link-input",
            }
        ),
        max_length=200,
    )
    file_format = forms.ChoiceField(
        choices=[
            ("m4a", "m4a"),
        ],
        widget=forms.Select(),
    )


def download(request):
    if request.method == "POST":
        form = linkForm(request.POST)
        if form.is_valid():
            link = form.cleaned_data["link"]
            file_format = form.cleaned_data["file_format"]

            if "spotify" in link:
                if "playlist" in link:
                    util.download_spotify_playlist(link, file_format)
                elif "track" in link:
                    util.download_spotify_song(link, file_format)
            elif "youtube" in link:
                util.download_youtube(link, file_format)

    return HttpResponseRedirect(reverse("index"))
