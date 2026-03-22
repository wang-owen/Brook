from django.conf import settings
from celery import shared_task
from celery.result import AsyncResult
from . import util


def check_task_status(task_id):
    result = AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": result.status,
        "result": result.result,
    }


ALLOWED_BREW_FUNCTIONS = {
    "download_youtube_track",
    "download_youtube_playlist",
    "download_spotify_track",
    "download_spotify_playlist",
    "download_new_tracks_task",
}


@shared_task
def task_brew(function_name, *args, **kwargs):
    if function_name not in ALLOWED_BREW_FUNCTIONS:
        raise ValueError(f"Function not allowed: {function_name}")
    func = getattr(util, function_name)
    result = func(*args, **kwargs)

    object_name = f"Music/{result.name}"

    if result:
        if settings.USE_S3 and settings.S3:
            settings.S3.upload_file(result, "brook", object_name)
            return object_name
        return str(result)
    return
