import random
from .models import Game

BOARD_AREA = 3


def get_turns():
    choices = ["❌", "⭕"]
    player_shape = random.choice(choices)
    choices.remove(player_shape)
    computer_shape = choices[0]
    turn = "❌"

    return (player_shape, computer_shape, turn)

def playMove(board, row, col, user):
    if (row, col) not in availableMoves(board):
        raise ValueError
    new_board = board
    new_board[row][col] = user
    return new_board


def availableMoves(board):
    moves = []

    for i in range(BOARD_AREA):
        for j in range(BOARD_AREA):
            if board[i][j] == " ":
                moves.append((i, j))
    return moves

def computer_move(
    board, difficulty, user, computer
):
    if all(cell == " " for row in board for cell in row):
        return random_move(board)

    if difficulty.lower() == "easy":
        probs = (0.9, 0.1)
    elif difficulty.lower() == "medium":
        probs = (0.4, 0.6)
    elif difficulty.lower() == "hard":
        probs = (0.2, 0.8)
    else:
        probs = (0, 1)
    if random.choices([0, 1], weights=probs) == [0]:
        return random_move(board)
    return find_move(board, user, computer)



def find_move(board, user: str, computer: str) -> tuple[int, int]:
    best_score = float("-inf")
    best_move = (-1, -1)

    for row in range(BOARD_AREA):
        for col in range(BOARD_AREA):
            if board[row][col] == " ":
                board[row][col] = computer
                score = minimax(board, False, 0, user, computer)
                board[row][col] = " "

                if score > best_score:
                    best_score = score
                    best_move = (row, col)

    return best_move


def minimax(board, is_max: bool, depth: int, user: str, computer: str) -> float:
    scores = {computer: 10, user: -10, "tie": 0}

    if check_winner(board, computer):
        return scores[computer] - depth
    elif check_winner(board, user):
        return scores[user] - depth
    elif all(cell != " " for row in board for cell in row):
        return scores["tie"]

    if is_max:
        best_score = float("-inf")
        for row in range(BOARD_AREA):
            for col in range(BOARD_AREA):
                if board[row][col] == " ":
                    board[row][col] = computer
                    score = minimax(board, False, depth + 1, user, computer)
                    board[row][col] = " "
                    best_score = max(score, best_score)
        return best_score
    else:
        best_score = float("inf")

        for row in range(BOARD_AREA):
            for col in range(BOARD_AREA):
                if board[row][col] == " ":
                    board[row][col] = user
                    score = minimax(board, True, depth + 1, user, computer)
                    board[row][col] = " "
                    best_score = min(score, best_score)
        return best_score


def check_winner(board, player: str):
    for row in range(BOARD_AREA):
        if board[row][0] == board[row][1] == board[row][2] == player:
            return True

    for col in range(BOARD_AREA):
        if board[0][col] == board[1][col] == board[2][col] == player:
            return True

    if (board[0][0] == board[1][1] == board[2][2] == player) or (
        board[0][2] == board[1][1] == board[2][0] == player
    ):
        return True
    return False


def random_move(board):
    return random.choice(availableMoves(board))


def game_over(board, user, computer):
    if check_winner(board, user):
        return "user"
    if check_winner(board, computer):
        return "computer"
    if all(cell != " " for row in board for cell in row):
        return "tie"


def clearBoard():
    board = []
    for _ in range(BOARD_AREA):
        row = []
        for _ in range(BOARD_AREA):
            row.append(" ")
        board.append(row)

    return board


def convert_board(board_str: str):
    counter = 0
    board = []
    for _ in range(BOARD_AREA):
        row = []
        for _ in range(BOARD_AREA):
            row.append(board_str[counter])
            counter += 1
        board.append(row)

    return board


def convert_2d_move_to_1d(move):
    return (move[0] * 3) + move[1]


def play_computer_move(game: Game, board):
    move_index_2d = computer_move(board, game.difficulty, game.player_shape, game.computer_shape)
    move_index_1d = convert_2d_move_to_1d(move_index_2d)
    board[move_index_2d[0]][move_index_2d[1]] = game.computer_shape

    print(move_index_1d)
    game_board_list = list(game.board)
    game_board_list[move_index_1d] = game.computer_shape
    game.board = ''.join(game_board_list)
    game.turn = game.player_shape
    game.save(update_fields=["board", "turn"])

    if winner := game_over(board, game.player_shape, game.computer_shape):
        results = {"type": "game_over", "winner": winner}
        return {"type": "computer_move", "move": move_index_1d}, results
    return {"type": "computer_move", "move": move_index_1d}, None


def board_is_empty(board):
    return all(cell == " " for row in convert_board(board) for cell in row)
