from django.urls import path
from .consumers import GameConsumer

websocket_urls = [
    path("ws/game/", GameConsumer.as_asgi())
]