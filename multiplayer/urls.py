from django.urls import path
from . import views

urlpatterns = [
    path("games", views.GameView.as_view()),
    path("create", views.CreateGameView.as_view()),
    path("join", views.JoinGameView.as_view()),
    path("get-game/<str:room_code>", views.GetGameView.as_view()),
]
