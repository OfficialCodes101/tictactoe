import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Grid, Typography, Alert, Collapse } from "@mui/material";
import Board from "./Board";
import GameOver from "./GameOver";
import GameAlert from "./GameAlert";
import useWebSocket from "react-use-websocket";

export default function Play(props) {
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

  const {
    getWebSocket,
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
  } = useWebSocket("ws://localhost:8000/ws/game/", {
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
      if (!data.winner) {
        setFeedback("Computer is thinking...");
        //getComputerMove();
        sendJsonMessage({ type: "get_computer_move" });
      } else if (data.winner === "tie") {
        getGame();
      } else {
        setGameOverData({ data: { winner: data.winner, gameOver: true } });
      }
    } else if (data.type === "computer_move") {
      const tempDisabled = [...disabledButtons];
      tempDisabled[data.move] = true;
      setDisabledButtons(tempDisabled);
      const tempBoard = [...board];
      tempBoard[data.move] = computerShape;
      setBoard(tempBoard);

      if (!data.winner) {
        setFeedback("Your move");
        setTurn(playerShape);
      } else if (data.winner === "tie") {
        getGame();
      } else {
        setTimeout(() => {
          setGameOverData({ data: { winner: data.winner, gameOver: true } });
        }, 1000);
      }
    }
  }

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
    fetch("/api/leave", requestOptions).then((response) => {
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
