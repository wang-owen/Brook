from django.contrib.auth import get_user_model, authenticate, login, logout
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.serializers import UserSerializer


# Create your views here.
User = get_user_model()


@api_view(["POST"])
def user_register(request):
    credentials = request.data
    serializer = UserSerializer(data=credentials)
    if serializer.is_valid():
        serializer.save()
        login(request, authenticate(request, **credentials))
        return Response({"message": "User registered"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def user_login(request):
    credentials = request.data
    user = authenticate(request, **credentials)
    if user:
        login(request, user)
        return Response({"message": "Logged in"}, status=status.HTTP_200_OK)
    return Response(
        {"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(["GET"])
def user_logout(request):
    logout(request)
    return Response({"message": "Logged out"}, status=status.HTTP_200_OK)
