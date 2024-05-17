from channels.generic.websocket import WebsocketConsumer
import json
from .models import Game
from .util import game_over, convert_board, play_computer_move, board_is_empty


class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.player = self.scope["session"]._get_session_from_db()
        print(self.player)
        queryset = Game.objects.filter(player=self.player)
        if queryset.exists():
            game = queryset[0]

            if results := game_over(convert_board(game.board), game.player_shape, game.computer_shape):
                winner = json.dumps({"type": "game_over", "winner": results})
                game.board = "         "
                game.save()
                self.send(winner)
                return
    
    def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
        except:
            return

        queryset = Game.objects.filter(player=self.player)
        if queryset.exists():
            game = queryset[0]

            if results := game_over(convert_board(game.board), game.player_shape, game.computer_shape):
                winner = json.dumps({"type": "game_over", "winner": results})
                game.board = "         "
                game.save()
                self.send(winner)
                return

            if data["type"] == "player_move":
                if not game.turn == game.player_shape:
                    return self.send(json.dumps({"type": "error", "message": "Not player's turn"}))
                move_index = data["move"]
                board = game.board
                game.board = board[:move_index] + game.player_shape + board[move_index+1:]
                game.turn = game.computer_shape
                game.save(update_fields=["board", "turn"])

                if results := game_over(convert_board(game.board), game.player_shape, game.computer_shape):
                    message = json.dumps({"type": "player_move", "winner": results})
                    game.board = "         "
                    game.save()
                else:
                    message = json.dumps({"type": "player_move", "winner": None})
                self.send(message)
                return
            
            elif data["type"] == "get_computer_move":
                board_str = game.board
                if not game.turn == game.computer_shape:
                    return self.send(json.dumps({"type": "error", "message": "Not computer's turn"}))
                results = play_computer_move(game, convert_board(board_str))
                return self.send(json.dumps(results))
        return super().receive(text_data, bytes_data)
    
    def disconnect(self, code):
        return super().disconnect(code)