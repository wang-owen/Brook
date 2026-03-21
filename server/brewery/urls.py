from django.urls import path
from . import views

urlpatterns = [
    path("brew/", views.brew),
    path("check-brew-status/<str:task_id>", views.get_brew_status),
    path("download/<path:path>", views.download),  # type: ignore
    path("playlist/", views.PlaylistList.as_view()),
    path("playlist/<str:playlist_id>", views.PlaylistDetail.as_view()),
    path("s3-presigned-url/", views.get_s3_presigned_url),
    path("youtube-oauth-token/", views.youtube_oauth_token),
]
