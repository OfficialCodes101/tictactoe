from rest_framework import serializers
from .models import Game


class GameSerializer(serializers.ModelSerializer):
    # board = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = (
            "room_code",
            "player_1",
            "player_2",
            "shape_1",
            "shape_2",
            "turn",
            "board",
        )

    # def get_board(self, obj):
    #     return list(obj.board)


class GetGameSerializer(serializers.ModelSerializer):
    board = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ("shape_1", "shape_2", "turn", "board", "state")

    def get_board(self, obj):
        return list(obj.board)
