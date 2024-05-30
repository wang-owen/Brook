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


@shared_task
def task_brew(function_name, *args, **kwargs):
    func = getattr(util, function_name)
    return str(func(*args, **kwargs))
