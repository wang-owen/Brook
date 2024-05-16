from django.urls import path
from . import views

urlpatterns = [
    path("get-logged-in", views.UserList.as_view()),
    path("register/", views.register_view),
    path("login/", views.login_view),
    path("logout/", views.logout_view),
]
