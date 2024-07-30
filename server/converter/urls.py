from django.urls import path
from . import views

urlpatterns = [
    path("convert/youtube/", views.toyoutube),
    path("convert/spotify/", views.tospotify),
]
