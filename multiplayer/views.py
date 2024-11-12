from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework import status
from .serializers import GameSerializer, GetGameSerializer
from .models import Game
from util.util import get_turns


# Create your views here.
class GameView(ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class CreateGameView(APIView):
    serializerclass = GameSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        shape_1, shape_2, turn = get_turns()
        game = Game(
            player_1=self.request.session.session_key,
            shape_1=shape_1,
            shape_2=shape_2,
            turn=turn,
        )

        print("Saving instance")
        game.save()
        print("Sending back response")

        return Response({"code": game.room_code}, status=status.HTTP_200_OK)


class JoinGameView(APIView):
    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        current_player = self.request.session.session_key
        room_code = request.data.get("room_code")
        queryset = Game.objects.filter(room_code=room_code)

        if queryset.exists():
            game = queryset[0]
            player_1 = game.player_1

            if player_1 == current_player:
                return Response(
                    {"error": "You can't be both players c'mon you're not that fat"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if game.player_2:
                return Response(
                    {"error": "Game is Full"}, status=status.HTTP_403_FORBIDDEN
                )

            game.player_2 = current_player
            game.save(update_fields=["player_2"])

            return Response(
                {"message": "Joined Successfully"}, status=status.HTTP_200_OK
            )

        return Response(
            {"error": "Game does not exist"}, status=status.HTTP_404_NOT_FOUND
        )


class GetGameView(APIView):
    serializer_class = GetGameSerializer

    def get(self, request, room_code, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        queryset = Game.objects.filter(room_code=room_code)

        if queryset.exists():
            game = queryset[0]
            players = [game.player_2, game.player_1]

            if self.request.session.session_key not in players:
                return Response(
                    {"error": "You're not in that game sir"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            response = self.serializer_class(game).data
            if self.request.session.session_key == game.player_1:
                response["your_shape"] = game.shape_1
                response["opponent_shape"] = game.shape_2
            else:
                response["your_shape"] = game.shape_2
                response["opponent_shape"] = game.shape_1

            del response["shape_2"]
            del response["shape_1"]

            return Response(response, status=status.HTTP_200_OK)

        return Response(
            {"error": "Game doesn't exist"}, status=status.HTTP_404_NOT_FOUND
        )
