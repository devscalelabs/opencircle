from celery import Celery
from celery.schedules import crontab

from src.core.settings import settings

celery_app = Celery(
    "opencircle",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "src.modules.notifications.notification_tasks",
        "src.modules.broadcast.broadcast_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    beat_schedule={
        "send-daily-notification-digest": {
            "task": "src.modules.notifications.notification_tasks.send_notification_digest",
            "schedule": crontab(hour=8, minute=0),
            "args": ("daily",),
        },
        "send-weekly-notification-digest": {
            "task": "src.modules.notifications.notification_tasks.send_notification_digest",
            "schedule": crontab(hour=8, minute=0, day_of_week=1),
            "args": ("weekly",),
        },
    },
)
