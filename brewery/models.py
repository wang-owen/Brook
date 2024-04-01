from django.db import models
from django.conf import settings


# Create your models here.
class Playlist(models.Model):
    id = models.CharField(max_length=128)
    watcher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=128)
    owner = models.CharField(max_length=128)
    platform = models.CharField(max_length=128)
    tracks = models.ManyToManyField("Track", related_name="playlists")
    thumbnail = models.URLField(blank=True)
    last_modified = models.DateTimeField(auto_now=True)


class Track(models.Model):
    id = models.CharField(max_length=128)
    name = models.CharField(max_length=128)
    artist = models.CharField(max_length=128)
    platform = models.CharField(max_length=128)
