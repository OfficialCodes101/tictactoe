from channels.generic.websocket import WebsocketConsumer
import json
from .models import Game
from .util import game_over, convert_board, play_computer_move, board_is_empty


class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.player = self.scope["session"]._get_session_from_db()
        print(self.scope)
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
        print(data)

        queryset = Game.objects.filter(player=self.player)
        if queryset.exists():
            game = queryset[0]

            if results := game_over(convert_board(game.board), game.player_shape, game.computer_shape):
                winner = json.dumps({"type": "game_over", "winner": results})
                game.board = "         "
                game.save()
                self.send(winner)
                print("Game over")
                return

            if data["type"] == "player_move":
                move_index = data.get("move")
                game_board_list = list(game.board)
                game_board_list[move_index] = game.player_shape
                game.board = ''.join(game_board_list)
                game.turn = game.computer_shape
                game.save(update_fields=["board", "turn"])
                print("Player move made")

                if results := game_over(convert_board(game.board), game.player_shape, game.computer_shape):
                    winner = json.dumps({"type": "game_over", "winner": results})
                    game.board = "         "
                    game.save()
                    self.send(winner)
                    print("Game over")
                return
            elif data["type"] == "get_computer_move":
                board_str = game.board
                if not game.turn == game.computer_shape:
                    return self.send(json.dumps({"error": "forbidden"}))
                computer_move, results = play_computer_move(game, convert_board(board_str))
                self.send(json.dumps(computer_move))

                if results is not None:
                    game.board = "         "
                    game.save()
                    self.send(json.dumps(results))
                return
        print("Nothing found")
                    
        return super().receive(text_data, bytes_data)
    
    def disconnect(self, code):
        return super().disconnect(code)