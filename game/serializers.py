from rest_framework import serializers

from .models import Game


class GameSerializer(serializers.ModelSerializer):
    board = serializers.SerializerMethodField()
    class Meta:
        model = Game
        fields = ("id", "player", "difficulty", "player_shape", "computer_shape", "turn", "board", "created_at")

    def get_board(self, obj):
        return list(obj.board)


class GameSetupSerializer(serializers.ModelSerializer):
    difficulty = serializers.ChoiceField(choices=["easy", "medium", "hard", "impossible"])
    class Meta:
        model = Game
        fields = ("difficulty",)
