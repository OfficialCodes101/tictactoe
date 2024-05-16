from django.urls import path
from . import views
from django.contrib.sessions.backends.db import SessionStore

urlpatterns = [
    path("games", views.GameView.as_view()),
    path("game", views.GetGame.as_view()),
    path("setup", views.SetupView.as_view()),
    path("is-ingame", views.IsInGame.as_view()),
    path("leave", views.LeaveGame.as_view()),
    path("player-move", views.PlayerMove.as_view()),
    path("computer-move", views.ComputerMove.as_view())
]
