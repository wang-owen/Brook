import os
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from users.serializers import UserSerializer
from dotenv import load_dotenv


# Create your views here.
load_dotenv()

User = get_user_model()


@api_view(["POST"])
def register_view(request):
    credentials = request.data
    serializer = UserSerializer(data=credentials)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"data": serializer.data, "message": "User registered"},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@ensure_csrf_cookie
def login_view(request):
    credentials = request.data
    user = authenticate(**credentials)
    if user:
        login(request, user)
        response = Response({"message": "Logged in"}, status=status.HTTP_200_OK)
        if COOKIE_DOMAIN := os.environ.get("DJANGO_COOKIE_DOMAIN"):
            response.set_cookie(
                key="sessionid",
                value=request.session.session_key,
                domain=COOKIE_DOMAIN,
                secure=True,
                httponly=True,
                samesite="Lax",
            )
            response.set_cookie(
                key="csrftoken",
                value=get_token(request),
                domain=COOKIE_DOMAIN,
                secure=True,
                httponly=False,
                samesite="Lax",
            )
        return response
    return Response(
        {"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out"}, status=status.HTTP_200_OK)


class UserList(APIView):
    def get(self, request):
        return Response(
            {"loggedIn": self.request.user.is_authenticated}, status=status.HTTP_200_OK
        )
