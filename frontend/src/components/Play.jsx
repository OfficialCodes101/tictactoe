import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Grid, Typography } from "@mui/material";
import Board from "./Board";
import GameOver from "./GameOver";

export default function Play(props) {
  const navigate = useNavigate();
  const [gameData, setGameData] = useState({
    data: {},
  });
  const [feedback, setFeedback] = useState("");
  const [disabledButtons, setDisabledButtons] = useState(Array(9).fill(true));
  const [gameOverData, setGameOverData] = useState({
    data: { gameOver: false, winner: null },
  });
  const [board, setBoard] = useState(Array(9).fill(" "));
  const [turn, setTurn] = useState(null);
  const [playerShape, setPlayerShape] = useState(null);
  const [computerShape, setComputerShape] = useState(null);

  function getGame() {
    fetch("/api/game")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          navigate("/");
        }
      })
      .then(async (data) => {
        setPlayerShape(data.player_shape);
        setComputerShape(data.computer_shape);
        setTurn(data.turn);
        setBoard(data.board);
        if (data.player_shape === data.turn) {
          setFeedback(`Your move`);
        } else {
          setFeedback(`Computer is thinking...`);
          getComputerMove();
        }
        const nonEmptyButtons = data.board.map((elem) => {
          return elem !== " ";
        });
        setDisabledButtons(nonEmptyButtons);
      });
  }

  function handleLeaveButtonClicked(e) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave", requestOptions).then((response) => {
      if (response.ok) {
        navigate("/");
      }
    });
  }

  async function getComputerMove() {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };

    fetch("/api/computer-move", requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Something went wrong");
      })
      .then((data) => {
        const tempDisabled = [];
        data.board.forEach((item, index) => {
          if (item === " ") {
            tempDisabled.push(false);
          } else {
            tempDisabled.push(true);
          }
        });
        setDisabledButtons(tempDisabled);

        setBoard(data.board);
        setTurn(data.turn);

        if (!data.winner) {
          setFeedback("Your move");
        } else if (data.winner === "tie") {
          getGame();
        } else {
          setDisabledButtons(Array(9).fill(true));
          setTimeout(() => {
            setGameOverData({ data: { winner: data.winner, gameOver: true } });
          }, 1000);
        }
      })
      .catch((err) => console.error(err.message));
  }

  function boardMoveCallback(index) {
    const tempDisabled = [...disabledButtons];
    tempDisabled[index] = true;
    setDisabledButtons(tempDisabled);
    setTurn(playerShape);

    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: index }),
    };
    fetch("/api/player-move", requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        const tempDisabled = [];
        data.board.forEach((item, index) => {
          if (item === " ") {
            tempDisabled.push(false);
          } else {
            tempDisabled.push(true);
          }
        });

        setDisabledButtons(tempDisabled);
        setBoard(data.board);
        if (!data.winner) {
          setFeedback("Computer is thinking...");
          getComputerMove();
        } else if (data.winner === "tie") {
          getGame();
        } else {
          setGameOverData({ data: { winner: data.winner, gameOver: true } });
        }
      });
  }

  async function boardWinnerCallback() {
    getGame();
    setGameOverData({ data: { ...gameOverData, gameOver: false } });
  }

  useEffect(() => {
    getGame();
  }, []);

  return (
    <Grid container spacing={2}>
      {gameOverData.data.gameOver ? (
        <GameOver
          data={gameOverData.data}
          boardWinnerCallback={boardWinnerCallback}
          leaveGameCallback={handleLeaveButtonClicked}
        />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {feedback ? (
              <Typography
                variant="h4"
                component="h4"
                color="goldenrod"
                align="center"
              >
                {feedback}
              </Typography>
            ) : null}
          </Grid>
          <Grid item xs={12} align="center">
            <Board
              disabledButtons={disabledButtons}
              board={board}
              computerShape={computerShape}
              turn={turn}
              boardMoveCallback={boardMoveCallback}
            ></Board>
          </Grid>
          <Grid item xs={12} align="center">
            <Button
              variant="contained"
              color="error"
              onClick={handleLeaveButtonClicked}
            >
              Abandon Game
            </Button>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
