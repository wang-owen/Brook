from rest_framework import serializers
from brewery.models import Playlist, Track


class TrackSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Track
        fields = "__all__"


class PlaylistSerializer(serializers.HyperlinkedModelSerializer):
    watcher = serializers.ReadOnlyField(source="watcher.email")

    class Meta:
        model = Playlist
        fields = "__all__"
