from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("download", views.download, name="download"),
    path("playlist/<str:playlist_platform>/<str:playlist_id>", views.playlist, name="playlist"),
]
