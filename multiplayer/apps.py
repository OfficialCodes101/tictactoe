from django.apps import AppConfig


class MultiplayerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "multiplayer"

    def ready(self) -> None:
        from .tasks import schedule_deletion_task

        schedule_deletion_task()
