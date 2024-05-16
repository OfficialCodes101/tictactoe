from django.urls import path
from . import views

urlpatterns = [
    path("", views.index),
    path("setup", views.index),
    path("play", views.index),
]
