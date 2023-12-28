from django.urls import path
from . import views

urlpatterns = [
    path("clear-files", views.clear_files, name="clear-files"),
    path("logout", views.logout_view, name="logout"),
]
