import threading
from django.utils import timezone
from datetime import timedelta
from .models import Game


def delete_stale_records():
    time_threshold = timezone.now() - timedelta(hours=2)
    old_records = Game.objects.filter(last_updated__lt=time_threshold)
    count, _ = old_records.delete()
    print(f"Deleted {count} stale record(s) from Multiplayer Game")


def schedule_deletion_task(interval=3600):
    """
    Runs the delete_stale_records function every interval seconds
    """
    delete_stale_records()
    threading.Timer(interval, schedule_deletion_task).start()
