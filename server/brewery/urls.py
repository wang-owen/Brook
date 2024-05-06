from django.urls import path
from . import views

urlpatterns = [
    path("brew/", views.brew),
    path("download/<path:path>", views.download),  # type: ignore
    path("playlist/", views.PlaylistList.as_view()),
    path("playlist/<int:pk>", views.PlaylistDetail.as_view()),
]
