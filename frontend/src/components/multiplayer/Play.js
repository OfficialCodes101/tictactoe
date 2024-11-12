import React, { useState } from "react";
import useWebSocket from "react-use-websocket";
import { Button, Grid, Typography } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Board from "./Board";
import WaitingPage from "./waitingPage";
import BlankWaitingPage from "./blankWaitingPage";
import GameOver from "./GameOver";
import ErrorAlert from "./ErrorAlert";

export default function PlayMultiplayer(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const roomCode = location?.state?.code;
  if (!roomCode) {
    return (
      <Grid item>
        <Typography paragraph={true} variant="h6">
          Go <Link to="/setup-multiplayer">back</Link> and join or create a room
        </Typography>
      </Grid>
    );
  }

  const [started, setStarted] = useState("blank");
  const [gameData, setGameData] = useState({
    data: {
      shape: null,
      opponentShape: null,
    },
  });
  const [gameOverData, setGameOverData] = useState({
    data: {
      gameOver: false,
      showRematchDialog: false,
      fromConnect: false,
      winner: null,
      pattern: [],
    },
  });
  const [oppConnected, setOppConnected] = useState(false);
  const [turn, setTurn] = useState("");
  const [board, setBoard] = useState(Array(9).fill(" "));
  const [disabledButtons, setDisabledButtons] = useState(Array(9).fill(true));
  const [userHelperText, setUserHelperText] = useState("");
  const [errorInfo, setErrorInfo] = useState({
    data: { show: false, message: null },
  });

  function getGame() {
    fetch(`/api/multiplayer/get-game/${roomCode}`)
      .then((res) => res.json())
      .then((obj) => {
        console.log(obj);
        if (obj.state === "started") {
          setStarted("yes");
        } else if (obj.state === "pending") {
          setStarted("waiting");
        }

        setGameData({
          data: {
            shape: obj.your_shape,
            opponentShape: obj.opponent_shape,
          },
        });

        if (obj.turn === obj.your_shape) {
          setUserHelperText("Your Move");
        } else {
          setUserHelperText("Opponent is Thinking...");
        }
        setBoard(obj.board);
        setTurn(obj.turn);
        const nonEmptyButtons = obj.board.map((elem) => elem !== " ");
        setDisabledButtons(nonEmptyButtons);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function playMove(index, shape) {
    const tempBoard = [...board];
    tempBoard[index] = shape;
    setBoard(tempBoard);
  }

  function addToDisabled(index) {
    const tempDisabled = [...disabledButtons];
    tempDisabled[index] = true;
    setDisabledButtons(tempDisabled);
  }

  function handleMessage(data) {
    console.log(data);

    if (data.error) {
      setErrorInfo({
        data: { show: true, message: data.error },
      });
      setTimeout(() => {
        setErrorInfo({ data: { show: false, message: null } });
      }, 2000);
    } else if (data.type === "start") {
      setErrorInfo({ data: { show: false, message: null } });
      setOppConnected(true);
      getGame();
      setStarted("yes");
      return;
    } else if (data.type === "opponent_disconnected") {
      setErrorInfo({
        data: { show: true, message: "Opponent disconnected..." },
      });
      setDisabledButtons(Array(9).fill(true));
      setOppConnected(false);
    } else if (data.type === "update_game") {
      let turn;
      if (data.content.shape !== gameData.data.shape) {
        turn = gameData.data.shape;
        playMove(data.content.index, data.content.shape);
        addToDisabled(data.content.index);
      } else {
        turn = gameData.data.opponentShape;
      }

      if (!data.content.winner) {
        if (turn === gameData.data.shape) {
          setUserHelperText("Your move");
        } else {
          setUserHelperText("Opponent is thinking...");
        }
        setTurn(turn);
      } else {
        if (data.content.winner === "tie") {
          getGame();
        } else {
          setGameOverData({
            data: {
              ...gameOverData.data,
              pattern: data.content.pattern,
              winner: data.content.winner,
            },
          });

          setTimeout(() => {
            setGameOverData({
              data: {
                ...gameOverData.data,
                gameOver: true,
                winner: data.content.winner,
              },
            });
          }, 2000);
        }
      }
    } else if (data.type === "game_over") {
      setStarted("ended");
      setGameOverData({
        data: {
          ...gameOverData.data,
          gameOver: true,
          fromConnect: true,
          winner: data.content.winner,
          pattern: data.content.pattern,
        },
      });
    } else if (data.type === "opponent_quit") {
      setOppConnected(false);
      setGameOverData({
        data: {
          ...gameOverData.data,
          gameOver: true,
          winner: gameData.data.shape,
        },
      });
    } else if (data.type === "request_rematch") {
      setGameOverData({
        data: { ...gameOverData.data, showRematchDialog: true },
      });
    } else if (data.type === "rematch") {
      getGame();
      setGameOverData({
        data: {
          ...gameOverData.data,
          gameOver: false,
          showRematchDialog: false,
          winner: null,
          pattern: [],
        },
      });
      setBoard(Array(9).fill(" "));
    }
  }

  function playMoveCallback(index) {
    const tempBoard = [...board];
    tempBoard[index] = gameData.data.shape;
    setTurn(gameData.data.opponentShape);
    setBoard(tempBoard);
    const tempDisabled = [...disabledButtons];
    tempDisabled[index] = true;
    setDisabledButtons(tempDisabled);

    sendJsonMessage({ type: "player_move", content: { move: index } });
  }

  function rematchCallback() {
    sendJsonMessage({ type: "request_rematch" });
  }

  function dialogOnConfirmCallback() {
    sendJsonMessage({ type: "rematch_accepted" });
  }

  function dialogOnCancelCallback() {
    setGameOverData({
      data: { ...gameOverData.data, showRematchDialog: false },
    });
  }

  const { sendJsonMessage } = useWebSocket(
    // Use window.location.hostname in deployment
    `ws://localhost:8000/ws/play-multiplayer/${roomCode}`,
    {
      onOpen: (e) => {
        setErrorInfo({ data: { show: false, message: null } });
        console.log("Connected");
        getGame();
      },
      onClose: (e) => {
        setErrorInfo({ data: { show: true, message: "Reconnecting..." } });
        console.error("Disconnected");
      },
      onMessage: (e) => handleMessage(JSON.parse(e.data)),
      shouldReconnect: () => true,
      onError: (err) => console.error(err),
    }
  );

  return (
    <Grid container spacing={2}>
      {started === "blank" ? (
        <BlankWaitingPage />
      ) : started === "waiting" ? (
        <WaitingPage code={roomCode} shapes={gameData.data} />
      ) : gameOverData.data.gameOver ? (
        <GameOver
          data={gameOverData.data}
          shape={gameData.data.shape}
          opponentShape={gameData.data.opponentShape}
          board={board}
          rematchCallback={rematchCallback}
          oppConnected={oppConnected}
          dialogOnConfirmCallback={dialogOnConfirmCallback}
          dialogOnCancelCallback={dialogOnCancelCallback}
        />
      ) : (
        <Grid container spacing={1}>
          <Grid item xs={12}>
            {userHelperText && !errorInfo.data.show ? (
              <Typography
                variant="h4"
                component="h4"
                color="goldenrod"
                align="center"
              >
                {userHelperText}
              </Typography>
            ) : null}
          </Grid>
          <Grid item xs={12}>
            <ErrorAlert
              showError={errorInfo.data.show}
              errorMessage={errorInfo.data.message}
            />
          </Grid>
          <Grid item xs={12} align="center">
            <Board
              data={gameData.data}
              pattern={gameOverData.data.pattern}
              winner={gameOverData.data.winner}
              playMoveCallback={playMoveCallback}
              disabledButtons={disabledButtons}
              board={board}
              turn={turn}
            />
          </Grid>

          <Grid item xs={12} align="center">
            {started === "blank" ? (
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  navigate("/");
                }}
              >
                Back
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  navigate("/");
                  sendJsonMessage({ type: "quit" });
                }}
              >
                Abandon Game
              </Button>
            )}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
