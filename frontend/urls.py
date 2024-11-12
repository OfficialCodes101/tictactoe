from django.urls import path
from . import views

urlpatterns = [
    path("", views.index),
    path("setup-computer", views.index),
    path("play-computer", views.index),
    path("setup-multiplayer", views.index),
    path("play-multiplayer", views.index),
]
