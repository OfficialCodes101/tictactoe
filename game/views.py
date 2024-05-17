from django.shortcuts import render
from django.http import HttpRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework import status

from .models import Game
from .serializers import GameSetupSerializer, GameSerializer
from .util import get_turns, game_over, convert_board, convert_2d_move_to_1d, computer_move

# Create your views here.
class GameView(ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class SetupView(APIView):
    serializer_class = GameSetupSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            difficulty = serializer.data.get("difficulty")
            player = self.request.session.session_key
            player_shape, computer_shape, turn = get_turns()

            queryset = Game.objects.filter(player=player)
            if queryset.exists():
                game = queryset[0]
                game.difficulty = difficulty
                game.save(update_fields=["difficulty"])
            else:
                game = Game(player=player, difficulty=difficulty, player_shape=player_shape, computer_shape=computer_shape, turn=turn)
                game.save()

            return Response(GameSerializer(game).data, status=status.HTTP_201_CREATED)
        return Response({'Bad Request': 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST)
    

class ResetView(APIView):
    def put(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        player = self.request.session.session_key
        queryset = Game.objects.filter(player=player)
        if queryset.exists():
            game = queryset[0]
            game.board = "         "
            game.save(update_fields=["board"])
            return Response(GameSerializer(game).data, status=status.HTTP_200_OK)
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)


class IsInGame(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        queryset = Game.objects.filter(player=self.request.session.session_key)
        if queryset.exists():
            return Response({'status': True}, status=status.HTTP_200_OK)
        return Response({'status': False}, status=status.HTTP_200_OK)


class GetGame(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        queryset = Game.objects.filter(player=self.request.session.session_key)
        if queryset.exists():
            return Response(GameSerializer(queryset[0]).data, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_404_NOT_FOUND)
    

class LeaveGame(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        queryset = Game.objects.filter(player=self.request.session.session_key)
        if queryset.exists():
            game = queryset[0]
            game.board = "         "
            player_shape, computer_shape, turn = get_turns()
            game.player_shape = player_shape
            game.computer_shape = computer_shape
            game.turn = turn
            game.save()
        return Response({}, status=status.HTTP_200_OK)
    

class PlayerMove(APIView):
    def put(self, request, format=None):
        queryset = Game.objects.filter(player=self.request.session.session_key)
        if queryset.exists():
            game = queryset[0]
            if not game.turn == game.player_shape:
                return Response({}, status=status.HTTP_403_FORBIDDEN)
            print(request.data)
            move_index = request.data.get("move")
            game_board_list = list(game.board)
            game_board_list[move_index] = game.player_shape
            board = game.board = ''.join(game_board_list)
            game.turn = game.computer_shape
            game.save(update_fields=["board", "turn"])

            winner = game_over(convert_board(game.board), game.player_shape, game.computer_shape)
            if winner:
                game.board = " " * 9
                game.save(update_fields=["board"])

            return Response({"winner": winner, "board": list(board)}, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_404_NOT_FOUND)
    
class ComputerMove(APIView):
    def put(self, request, format=None):
        queryset = Game.objects.filter(player=self.request.session.session_key)
        if queryset.exists():
            game = queryset[0]
            if not game.turn == game.computer_shape:
                return Response({}, status=status.HTTP_403_FORBIDDEN)
            move_index = convert_2d_move_to_1d(computer_move(convert_board(game.board), game.difficulty, game.player_shape, game.computer_shape))
            game_board_list = list(game.board)
            game_board_list[move_index] = game.computer_shape
            board = game.board = ''.join(game_board_list)
            game.turn = game.player_shape
            game.save(update_fields=["board", "turn"])

            winner = game_over(convert_board(game.board), game.player_shape, game.computer_shape)
            if winner:
                game.board = " " * 9
                game.save(update_fields=["board"])
            

            return Response({"move": move_index,"winner": winner, "board": list(board)}, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_404_NOT_FOUND)