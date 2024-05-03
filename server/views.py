from django.http import FileResponse
from django.contrib.auth.decorators import login_required
from . import util


# Create your views here.
def _get_platform(link):
    for url in util.YOUTUBE_URLS:
        if url in link:
            return util.YOUTUBE
    for url in util.SPOTIFY_URLS:
        if url in link:
            return util.SPOTIFY
    return None


def _get_content_type(link):
    # Need to check for playlist first since single tracks in a playlist will also contain "list" in the URL
    for url in util.PLAYLIST_URLS:
        if url in link:
            return util.PLAYLIST
    for url in util.TRACK_URLS:
        if url in link:
            return util.TRACK
    return None


def brew(link, file_format):
    platform = _get_platform(link)
    content_type = _get_content_type(link)

    # Invalid link
    if not platform or not content_type:
        return False

    try:
        if content_type == util.PLAYLIST:
            return util.download_playlist(link, file_format, platform)
        elif content_type == util.TRACK:
            return util.download_track(link, file_format, platform)
    except (KeyError, IndexError):
        # Invalid link
        return False

    return False


def get_data(link):
    platform = _get_platform(link)
    content_type = _get_content_type(link)

    return {
        "platform": platform,
        "contentType": content_type,
        "playlistData": (
            util.get_playlist_data(link, platform)
            if content_type == util.PLAYLIST
            else None
        ),
        "trackData": (
            util.get_track_data(link, platform) if content_type == util.TRACK else None
        ),
    }


def get_file(path):
    try:
        # Determine whether file is a zip or audio file
        if "zip" in path:
            content_type = "application/zip"
        else:
            content_type = f"audio/{path.split('.')[-1]}"

        # Return file to client
        response = FileResponse(
            open(path, "rb"), as_attachment=True, content_type=content_type
        )
        response["Content-Disposition"] = f"attachment; filename={path.split('/')[-1]}"
        return response
    except FileNotFoundError as e:
        print(e)
        return False
