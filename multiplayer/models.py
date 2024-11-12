from django.db import models
import random


# Create your models here.
class Game(models.Model):
    def generate_code():
        code = str(random.randint(100000, 999999))
        while Game.objects.filter(room_code=code).exists():
            code = str(random.randint(100000, 999999))
        return code

    room_code = models.CharField(max_length=8, default=generate_code)
    player_1 = models.CharField(max_length=50, null=True, blank=True)
    player_2 = models.CharField(max_length=50, null=True, blank=True)
    shape_1 = models.CharField(max_length=1, null=True, blank=True)
    shape_2 = models.CharField(max_length=1, null=True, blank=True)
    state = models.CharField(max_length=10, default="pending")
    turn = models.CharField(max_length=1)
    board = models.CharField(max_length=9, default=" " * 9)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
