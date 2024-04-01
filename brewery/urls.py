from django.urls import path
from . import views

urlpatterns = [
    path("brew", views.brew, name="brew"),
    path("brew/<str:playlist_id>", views.brew, name="brew"),
    path("download/<path:path>", views.download, name="download"),
    path("get-playlists", views.get_playlists, name="get-playlists"),
    path("update/<str:playlist_id>", views.update, name="update"),
    path("remove/<str:playlist_id>", views.remove, name="remove"),
    path(
        "playlist/<str:playlist_platform>/<str:playlist_id>",
        views.playlist,
        name="playlist",
    ),
    path("watch", views.watch, name="watch"),
]
