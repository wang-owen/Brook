from .headers import *
from . import youtube
from . import spotify


def get_platform(link):
    for url in YOUTUBE_URLS:
        if url in link:
            return YOUTUBE
    for url in SPOTIFY_URLS:
        if url in link:
            return SPOTIFY
    for url in AMAZON_URLS:
        if url in link:
            return AMAZON
    return None


def get_content_type(link):
    # Need to check for playlist first since single tracks in a playlist will also contain "list" in the URL
    content = None
    for url in PLAYLIST_URLS:
        if url in link:
            content = PLAYLIST
            break
    for url in TRACK_URLS:
        if url in link:
            return TRACK
    return content


def get_data(link):
    platform = get_platform(link)
    content_type = get_content_type(link)

    return {
        "platform": platform,
        "contentType": content_type,
        "playlist_data": (
            get_playlist_data(link, platform) if content_type == PLAYLIST else None
        ),
        "track_data": (
            get_track_data(link, platform) if content_type == TRACK else None
        ),
    }


def get_playlist_data(link, platform):
    if platform == YOUTUBE:
        return youtube.get_youtube_playlist_data(link)
    if platform == SPOTIFY:
        return spotify.get_spotify_playlist_data(link)
    return None  # Invalid platform


def get_track_data(link, platform):
    if platform == YOUTUBE:
        return youtube.get_youtube_track_data(link)
    elif platform == SPOTIFY:
        return spotify.get_spotify_track_data(link)
    return None  # Invalid platform


def get_playlist_link(platform, id_):
    """Get playlist link from YouTube or Spotify id

    Args:
        id (str): id of YouTube or Spotify playlist

    Returns:
        str: link to playlist
    """
    if platform == YOUTUBE:
        return f"https://www.youtube.com/playlist?list={id_}"
    elif platform == SPOTIFY:
        return f"https://open.spotify.com/playlist/{id_}"
    return ""


def get_track_link(platform, id_):
    """Get track link from YouTube or Spotify id

    Args:
        platform (str): platform of track (youtube or spotify)
        id_ (str): id of YouTube or Spotify track

    Returns:
        str: link to track
    """
    if platform == YOUTUBE:
        return f"https://www.youtube.com/watch?v={id_}"
    elif platform == SPOTIFY:
        return f"https://open.spotify.com/track/{id_}"
    return ""
