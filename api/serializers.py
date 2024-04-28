from rest_framework import serializers
from server.models import Playlist, Track
from users.models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "date_joined"]


class TrackSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Track
        fields = "__all__"


class PlaylistSerializer(serializers.HyperlinkedModelSerializer):
    tracks = TrackSerializer(many=True)

    class Meta:
        model = Playlist
        fields = "__all__"
