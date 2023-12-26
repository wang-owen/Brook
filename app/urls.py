from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("download/", views.download, name="download"),
    path("download/<str:playlist_id>/", views.download, name="download"),
    path("update/<str:playlist_id>/", views.update, name="update"),
    path("remove/<str:playlist_id>/", views.remove, name="remove"),
    path(
        "playlist/<str:playlist_platform>/<str:playlist_id>/",
        views.playlist,
        name="playlist",
    ),
]
