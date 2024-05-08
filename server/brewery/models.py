from django.db import models
from django.conf import settings


# Create your models here.
class Playlist(models.Model):
    playlist_id = models.CharField(max_length=128)
    watcher = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="playlists", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=128)
    owner = models.CharField(max_length=128)
    link = models.URLField(blank=False)
    platform = models.CharField(max_length=128)
    thumbnail = models.URLField(blank=True)
    last_modified = models.DateTimeField(auto_now=True)


class Track(models.Model):
    track_id = models.CharField(max_length=128)
    playlist = models.ForeignKey(
        Playlist, related_name="tracks", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=128)
    artist = models.CharField(max_length=128)
    platform = models.CharField(max_length=128)
