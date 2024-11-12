import redis
from django.conf import settings


redis_client = redis.StrictRedis()

GAME_ROOM_ONLINE_PLAYERS_KEY = "game_room:{}"


def add_online_player(room_id, player_id):
    return redis_client.sadd(GAME_ROOM_ONLINE_PLAYERS_KEY.format(room_id), player_id)


def remove_online_player(room_id, player_id):
    return redis_client.srem(GAME_ROOM_ONLINE_PLAYERS_KEY.format(room_id), player_id)


def get_online_players_in_room_count(room_id):
    return redis_client.scard(GAME_ROOM_ONLINE_PLAYERS_KEY.format(room_id))


def is_game_ready(room_id):
    return redis_client.scard(GAME_ROOM_ONLINE_PLAYERS_KEY.format(room_id)) == 2
