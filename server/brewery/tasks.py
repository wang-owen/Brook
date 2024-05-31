from django.conf import settings
from celery import shared_task
from celery.result import AsyncResult
import boto3
from . import util

s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)


def check_task_status(task_id):
    result = AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": result.status,
        "result": result.result,
    }


@shared_task
def task_brew(function_name, *args, **kwargs):
    func = getattr(util, function_name)
    path = func(*args, **kwargs)
    s3.upload_file(path, "brook", path.name)
    return path
