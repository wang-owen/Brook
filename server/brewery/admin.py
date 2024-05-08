from django.contrib import admin
from .models import Playlist, Track


# Register your models here.
class PlaylistAdmin(admin.ModelAdmin):
    list_display = [
        "playlist_id",
        "watcher",
        "name",
        "owner",
        "link",
        "platform",
        "thumbnail",
        "last_modified",
    ]


class TrackAdmin(admin.ModelAdmin):
    list_display = [
        "track_id",
        "playlist",
        "name",
        "artist",
        "platform",
    ]


admin.site.register(Playlist, PlaylistAdmin)
admin.site.register(Track, TrackAdmin)
