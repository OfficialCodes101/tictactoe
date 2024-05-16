from django.db import models

# Create your models here.
class Game(models.Model):
    player = models.CharField(max_length=50, unique=True)
    difficulty = models.CharField(max_length=10)
    player_shape = models.CharField(max_length=1)
    computer_shape = models.CharField(max_length=1)
    turn = models.CharField(max_length=1)
    board = models.CharField(max_length=9, default="         ")
    created_at = models.DateTimeField(auto_now_add=True, null=True)