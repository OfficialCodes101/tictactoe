"""
ASGI config for tictactoe project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tictactoe.settings")
django_asgi_application = get_asgi_application()

from computer.consumers import ComputerConsumer
from multiplayer.consumers import MultiplayerConsumer

application = ProtocolTypeRouter(
    {
        "http": django_asgi_application,
        "websocket": AuthMiddlewareStack(
            URLRouter(
                [
                    path("ws/play-computer/", ComputerConsumer.as_asgi()),
                    path(
                        "ws/play-multiplayer/<str:room_code>",
                        MultiplayerConsumer.as_asgi(),
                    ),
                ]
            )
        ),
    }
)
