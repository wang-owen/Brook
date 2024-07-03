import shutil, yt_dlp
from datetime import datetime
from pathlib import Path
from django.http import FileResponse
from django.conf import settings
from .tasks import task_brew
from ..common import utils


ILLEGAL_CHARS = [
    "#",
    "%",
    "&",
    "{",
    "}",
    "\\",
    "<",
    ">",
    "*",
    "?",
    "/",
    "$",
    "!",
    "'",
    '"',
    ":",
    "@",
    "+",
    "`",
    "|",
    "=",
    ";",
]


MUSIC_DIR = settings.MUSIC_DIR
PLAYLISTS_DIR = MUSIC_DIR / "Playlists"
TRACKS_DIR = MUSIC_DIR / "Tracks"
DEFAULT_FILE_FORMAT = "m4a"


def _mkdirs():
    if not MUSIC_DIR.exists():
        MUSIC_DIR.mkdir()
    if not PLAYLISTS_DIR.exists():
        PLAYLISTS_DIR.mkdir()
    if not TRACKS_DIR.exists():
        TRACKS_DIR.mkdir()


_mkdirs()


def brew(
    link=None, new_tracks=None, playlist_name=None, platform=None, file_format="m4a"
):
    _mkdirs()

    if link:
        platform = utils.get_platform(link)
        content_type = utils.get_content_type(link)

        # Invalid link
        if not platform or not content_type:
            return False

        try:
            if content_type == utils.PLAYLIST:
                return download_playlist(link, file_format, platform)
            elif content_type == utils.TRACK:
                return download_track(link, file_format, platform)
        except (KeyError, IndexError):
            # Invalid link
            return False
    elif new_tracks:
        try:
            return download_new_tracks(new_tracks, playlist_name, platform, file_format)
        except (KeyError, IndexError):
            # Invalid link
            return False

    return False


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


def download_playlist(link, file_format, platform):
    dir_ = (
        settings.BASE_DIR
        / PLAYLISTS_DIR
        / datetime.utcnow().strftime("%Y-%m-%d %H-%M-%S")
    )
    if dir_.exists():
        return False
    dir_.mkdir()

    if platform == utils.YOUTUBE:
        task = task_brew.delay(
            "download_youtube_playlist", link, file_format, str(dir_)
        )
        return task.id
    elif platform == utils.SPOTIFY:
        task = task_brew.delay(
            "download_spotify_playlist", link, file_format, str(dir_)
        )
        return task.id
    return False


def download_track(link, file_format, platform, dir_=None):
    if not dir_:
        dir_ = (
            settings.BASE_DIR
            / TRACKS_DIR
            / datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
        )
        if dir_.exists():
            return False
        dir_.mkdir()

    # Download tracks asynchronously
    if platform == utils.YOUTUBE:
        task = task_brew.delay("download_youtube_track", link, file_format, str(dir_))
        return task.id
    elif platform == utils.SPOTIFY:
        task = task_brew.delay("download_spotify_track", link, file_format, str(dir_))
        return task.id
    return False


def download_new_tracks(new_tracks, playlist_name, platform, file_format):
    dir_ = (
        settings.BASE_DIR
        / PLAYLISTS_DIR
        / datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
    )
    if dir_.exists():
        return False
    dir_.mkdir()

    playlist_name = f"{playlist_name}-UPDATED"
    # Remove illegal filename characters from playlist name
    for char in ILLEGAL_CHARS:
        playlist_name = playlist_name.replace(char, "-")
    playlist_dir = dir_ / playlist_name

    task = task_brew.delay(
        "download_new_tracks_task", new_tracks, platform, file_format, str(playlist_dir)
    )
    return task.id


def download_new_tracks_task(new_tracks, platform, file_format, dir_):
    if platform == utils.YOUTUBE:
        for track in new_tracks:
            download_youtube_track(
                utils.get_track_link(platform, track.get("track_id")), file_format, dir_
            )
    elif platform == utils.SPOTIFY:
        for track in new_tracks:
            download_spotify_track(
                utils.get_track_link(platform, track.get("track_id")), file_format, dir_
            )

    path = shutil.make_archive(str(dir_), "zip", dir_)
    shutil.rmtree(dir_)

    return Path(path)


def download_youtube_track(link, file_format, dir_):
    """Download YouTube track or playlist from link

    Args:
        link (str): link to YouTube track or playlist
        file_format (str): file format to download tracks in
        dir_ (str): directory to download tracks to
    """
    ydl_opts = {
        "outtmpl": f"{dir_}/%(title)s [%(id)s].%(ext)s",
        "format": f"ba[ext={file_format}]",
        "restrictfilenames": True,
        "writethumbnail": True,
        "embedthumbnail": True,
        "noplaylist": True,
        "ignoreerrors": True,
        "postprocessors": [
            {
                "key": "FFmpegMetadata",
                "add_metadata": True,
            },
            {
                "key": "EmbedThumbnail",
            },
        ],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        path = ydl.prepare_filename(ydl.extract_info(link, download=True))

        return Path(path)


def download_youtube_playlist(link, file_format, dir_):
    """Download YouTube track or playlist from link

    Args:
        link (str): link to YouTube track or playlist
        file_format (str): file format to download tracks in
        dir_ (str): directory to download tracks to
    """
    playlist_name = utils.get_youtube_playlist_data(link)["name"]
    # Remove illegal filename characters from playlist name
    for char in ILLEGAL_CHARS:
        playlist_name = playlist_name.replace(char, "-")
    playlist_dir = Path(dir_) / playlist_name

    ydl_opts = {
        "outtmpl": f"{playlist_dir}/%(title)s [%(id)s].%(ext)s",
        "format": f"ba[ext={file_format}]",
        "writethumbnail": True,
        "embedthumbnail": True,
        "ignoreerrors": True,
        "postprocessors": [
            {
                "key": "FFmpegMetadata",
                "add_metadata": True,
            },
            {
                "key": "EmbedThumbnail",
            },
        ],
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([link])

    # Delete leftover thumbnail file
    for img_file in Path(playlist_dir).glob("*.jpg"):
        img_file.unlink()

    # Compress folder
    path = shutil.make_archive(str(playlist_dir), "zip", playlist_dir)
    shutil.rmtree(playlist_dir)

    return Path(path)


def _download_youtube_search(name, artist, track_id, file_format, dir_):
    """Download YouTube track from search query

    Args:
        name (str): track name
        artist (str): artist name
        file_format (str): file format to download track in
        dir_ (str): directory to download tracks to
    """
    legal_name = name
    for char in ILLEGAL_CHARS:
        legal_name = legal_name.replace(char, "-")
    path = Path(dir_) / f"{legal_name} [{track_id}].{file_format}"

    ydl_opts = {
        "outtmpl": f"{dir_}/{legal_name} [{track_id}].%(ext)s",
        "format": f"ba[ext={file_format}]",
        "restrictfilenames": True,
        "writethumbnail": True,
        "embedthumbnail": True,
        "noplaylist": True,
        "ignoreerrors": True,
        "postprocessors": [
            {
                "key": "FFmpegMetadata",
                "add_metadata": True,
            },
            {
                "key": "EmbedThumbnail",
            },
        ],
        "default_search": "https://music.youtube.com/search?q=",
        "playlist_items": "1",
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.extract_info(f"{name} {artist}", download=True)
        return Path(path)


def download_spotify_track(link, file_format, dir_):
    """Download Spotify track from link

    Args:
        link (str): link to Spotify track
        file_format (str): file format to download track in
        dir_ (str): directory to download tracks to
    """
    data = utils.get_spotify_track_data(link)
    return _download_youtube_search(
        data["name"], data["artist"], data["track_id"], file_format, dir_
    )


def download_spotify_playlist(link, file_format, dir_):
    """Download Spotify playlist from link

    Args:
        link (str): link to Spotify playlist
        file_format (str): file format to download tracks in
        dir_ (str): directory to download tracks to
    """
    data = utils.get_spotify_playlist_data(link)
    playlist_name = data["name"]
    # Remove illegal filename characters from playlist name
    for char in ILLEGAL_CHARS:
        playlist_name = playlist_name.replace(char, "-")
    playlist_dir = Path(dir_) / playlist_name

    tracks = data["tracks"]
    for track in tracks:
        _download_youtube_search(
            track["name"], track["artist"], track["track_id"], file_format, playlist_dir
        )

    # Compress folder
    path = shutil.make_archive(str(playlist_dir), "zip", playlist_dir)
    shutil.rmtree(playlist_dir)

    return Path(path)
