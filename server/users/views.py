from django.contrib.auth import get_user_model, authenticate, login, logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from users.serializers import UserSerializer


# Create your views here.
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
def login_view(request):
    credentials = request.data
    user = authenticate(**credentials)
    if user:
        login(request, user)
        return Response({"message": "Logged in"}, status=status.HTTP_200_OK)
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
