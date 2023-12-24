from django.db import models
import os


# Create your models here.
class Playlist(models.Model):
    title = models.CharField(max_length=64)
    owner = models.CharField(max_length=64)
    platform = models.CharField(max_length=64)
    link = models.URLField(max_length=200)
    thumbnail = models.ImageField(
        upload_to=os.path.join("playlist_history", "thumbnails"), blank=True
    )

    def __str__(self):
        return f"{self.platform}: {self.title}"


class Song(models.Model):
    name = models.CharField(max_length=64)
    artist = models.CharField(max_length=64)
    playlist = models.ForeignKey(
        Playlist, on_delete=models.CASCADE, related_name="songs"
    )

    def __str__(self):
        return f"{self.playlist.title}: {self.name} by {self.artist}"
