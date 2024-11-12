from channels.generic.websocket import WebsocketConsumer
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
import json
from .models import Game
from util.redis_util import (
    add_online_player,
    remove_online_player,
    is_game_ready,
    get_online_players_in_room_count,
)
from util.util import game_over, convert_board


class MultiplayerConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

        self.player = self.scope["session"].session_key
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]
        game = get_object_or_404(Game, room_code=self.room_code)
        players = [game.player_1, game.player_2]

        if self.player not in players or self.player is None:
            return self.close()

        if self.player == game.player_1:
            self.shape = game.shape_1
            self.opponent_shape = game.shape_2
        elif self.player == game.player_2:
            self.shape = game.shape_2
            self.opponent_shape = game.shape_1

        if game.state == "ended":
            game_results = game_over(
                convert_board(game.board), self.shape, self.opponent_shape
            )
            if game_results:
                winner, pattern = game_results
                return self.send(
                    json.dumps(
                        {
                            "type": "game_over",
                            "content": {"winner": winner, "pattern": pattern},
                        }
                    )
                )

        async_to_sync(self.channel_layer.group_add)(self.room_code, self.channel_name)
        add_online_player(self.room_code, self.player)
        print(
            f"{self.player} joined, there's now {get_online_players_in_room_count(self.room_code)} players in room"
        )

        if is_game_ready(self.room_code):
            game.state = "started"
            game.save(update_fields=["state"])
            event = {"type": "start_game"}
            async_to_sync(self.channel_layer.group_send)(self.room_code, event)

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_code, self.channel_name
        )
        remove_online_player(self.room_code, self.player)
        event = {"type": "pause_game"}
        async_to_sync(self.channel_layer.group_send)(self.room_code, event)
        print(
            f"{self.player} left, there's now {get_online_players_in_room_count(self.room_code)} player(s) left"
        )

        return super().disconnect(code)

    def receive(self, text_data=None, bytes_data=None):
        data_json = json.loads(text_data)

        if data_json["type"] == "player_move":
            return self.handle_move(data_json["content"]["move"])

        if data_json["type"] == "quit":
            return self.handle_quit()

        if data_json["type"] == "request_rematch":
            event = {"type": "request_rematch", "player": self.channel_name}
            return async_to_sync(self.channel_layer.group_send)(self.room_code, event)

        if data_json["type"] == "rematch_accepted":
            event = {"type": "rematch_accepted"}
            return async_to_sync(self.channel_layer.group_send)(self.room_code, event)

    def handle_move(self, index):
        game = get_object_or_404(Game, room_code=self.room_code)

        if game.state == "ended":
            return async_to_sync(self.channel_layer.group_send)(
                self.room_code, {"type": "send_game_ended"}
            )

        if not game.turn == self.shape:
            return self.send(json.dumps({"error": "Not your turn"}))

        temp_board = game.board
        game.board = temp_board[:index] + self.shape + temp_board[index + 1 :]
        game.turn = self.opponent_shape
        game.save(update_fields=["board", "turn"])
        game_results = game_over(
            convert_board(game.board), self.shape, self.opponent_shape
        )  # HERE

        move_event = {
            "type": "send_move",
            "content": {
                "index": index,
                "shape": self.shape,
                "winner": None,
            },
        }
        if game_results:
            if game_results[0] == "tie":
                game.board = " " * 9
                game.save(update_fields=["board"])
                move_event["content"]["winner"] = "tie"
            else:
                winner, pattern = game_results
                move_event["content"]["winner"] = winner
                move_event["content"]["pattern"] = pattern
                game.state = "ended"
                game.save(update_fields=["state"])

        async_to_sync(self.channel_layer.group_send)(self.room_code, move_event)

    def handle_quit(self):
        return async_to_sync(self.channel_layer.group_send)(
            self.room_code, {"type": "send_quit", "player": self.channel_name}
        )

    def start_game(self, event):
        self.send(json.dumps({"type": "start"}))

    def pause_game(self, event):
        self.send(json.dumps({"type": "opponent_disconnected"}))

    def send_move(self, event):
        return self.send(json.dumps({**event, "type": "update_game"}))

    def send_quit(self, event):
        if self.channel_name != event["player"]:
            self.send(json.dumps({"type": "opponent_quit"}))

    def request_rematch(self, event):
        if self.channel_name != event["player"]:
            self.send(json.dumps({"type": "request_rematch"}))

    def send_game_ended(self, event):
        self.send(json.dumps({"error": "Game ended"}))

    def rematch_accepted(self, event):
        queryset = Game.objects.filter(room_code=self.room_code)
        if queryset.exists():
            game = queryset[0]
            game.state = "started"
            game.board = " " * 9
            game.save(update_fields=["state", "board"])
            self.send(json.dumps({"type": "rematch"}))


# DON'T FORGET TO HANDLE FRONTEND AFTER ROOM CODE IS DELETED
