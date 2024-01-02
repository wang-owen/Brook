from django.db import models
from django.conf import settings


# Create your models here.
class Playlist(models.Model):
    watcher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    id = models.CharField(max_length=128, primary_key=True)
    name = models.CharField(max_length=128)
    owner = models.CharField(max_length=128)
    platform = models.CharField(max_length=128)
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
    playlist = models.ForeignKey(
        Playlist, on_delete=models.CASCADE, related_name="tracks"
    )
    id = models.CharField(max_length=128, primary_key=True)
    name = models.CharField(max_length=128)
    artist = models.CharField(max_length=128)
    platform = models.CharField(max_length=128)

    def __str__(self):
        return f"{self.playlist.name}: {self.name} by {self.artist}"
