import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Grid, Typography } from "@mui/material";
import Board from "./Board";
import GameOver from "./GameOver";
import GameAlert from "./GameAlert";
import useWebSocket from "react-use-websocket";

export default function PlayComputer(props) {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [disabledButtons, setDisabledButtons] = useState(Array(9).fill(true));
  const [gameOverData, setGameOverData] = useState({
    data: { gameOver: false, winner: null },
  });
  const [board, setBoard] = useState(Array(9).fill(" "));
  const [turn, setTurn] = useState(null);
  const [playerShape, setPlayerShape] = useState(null);
  const [computerShape, setComputerShape] = useState(null);
  const [alertActive, setAlertActive] = useState(false);
  const [pattern, setPattern] = useState([]);

  const {
    getWebSocket,
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
  } = useWebSocket("ws://localhost:8000/ws/play-computer/", {
    onOpen: () => {
      console.log("Connected");
      setAlertActive(false);
      getGame();
    },
    onClose: () => {
      console.log("Disconnected");
      setAlertActive(true);
      setFeedback(null);
      setDisabledButtons(Array(9).fill(true));
    },
    onError: (e) => console.log(e),
    onMessage: (message) => handleMessages(JSON.parse(message.data)),
    shouldReconnect: () => true,
  });

  function handleMessages(data) {
    console.log(data);
    if (data.type === "player_move") {
      if (!data.content.winner) {
        setFeedback("Computer is thinking...");
        //getComputerMove();
        sendJsonMessage({ type: "get_computer_move" });
      } else if (data.content.winner === "tie") {
        getGame();
      } else {
        setGameOverData({
          data: {
            ...gameOverData.data,
            winner: data.content.winner,
          },
        });
        setPattern(data.content.pattern);

        setTimeout(() => {
          setGameOverData({
            data: {
              ...gameOverData.data,
              gameOver: true,
            },
          });
        }, 2000);
      }
    } else if (data.type === "computer_move") {
      const tempDisabled = [...disabledButtons];
      tempDisabled[data.content.move] = true;
      setDisabledButtons(tempDisabled);
      const tempBoard = [...board];
      tempBoard[data.content.move] = computerShape;
      setBoard(tempBoard);

      if (!data.content.winner) {
        setFeedback("Your move");
        setTurn(playerShape);
      } else if (data.content.winner === "tie") {
        getGame();
      } else {
        setGameOverData({
          data: {
            ...gameOverData.data,
            winner: data.content.winner,
          },
        });
        setPattern(data.content.pattern);
        setTimeout(() => {
          setGameOverData({
            data: {
              ...gameOverData.data,
              gameOver: true,
            },
          });
        }, 2000);
      }
    } else if (data.type === "game_over") {
    }
  }

  function getGame() {
    fetch("/api/computer/game")
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
          sendJsonMessage({ type: "get_computer_move" });
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
    fetch("/api/computer/leave", requestOptions).then((response) => {
      if (response.ok) {
        navigate("/");
      }
    });
  }

  function boardMoveCallback(index) {
    const tempDisabled = [...disabledButtons];
    tempDisabled[index] = true;
    setDisabledButtons(tempDisabled);
    setTurn(computerShape);
    const tempBoard = [...board];
    tempBoard[index] = playerShape;
    setBoard(tempBoard);

    sendJsonMessage({ type: "player_move", move: index });
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
          player={playerShape}
          computer={computerShape}
        />
      ) : (
        <Grid container spacing={2}>
          <GameAlert alertActive={alertActive} />
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
              playerShape={playerShape}
              computerShape={computerShape}
              turn={turn}
              boardMoveCallback={boardMoveCallback}
              gameOverData={gameOverData.data}
              pattern={pattern}
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
