from django.db import models
import os


# Create your models here.
class Playlist(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=64)
    owner = models.CharField(max_length=64)
    platform = models.CharField(max_length=64)
    thumbnail = models.URLField(blank=True)
    last_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.platform}: {self.name}"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "owner": self.owner,
            "platform": self.platform,
            "thumbnail": self.thumbnail,
        }


class Track(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=64)
    artist = models.CharField(max_length=64)
    platform = models.CharField(max_length=64)
    playlist = models.ForeignKey(
        Playlist, on_delete=models.CASCADE, related_name="tracks"
    )

    def __str__(self):
        return f"{self.playlist.name}: {self.name} by {self.artist}"
