from rest_framework import serializers
from django.contrib.auth import get_user_model
from brewery.models import Playlist


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    playlists = serializers.HyperlinkedRelatedField(
        many=True, view_name="PlaylistDetail", read_only=True
    )

    class Meta:
        model = User
        fields = ["email", "username", "password", "playlists"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data["password"])
        user.save()
        return user
