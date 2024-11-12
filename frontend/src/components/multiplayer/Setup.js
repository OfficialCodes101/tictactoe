import {
  FormHelperText,
  Grid,
  RadioGroup,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  Button,
  ButtonGroup,
} from "@mui/material";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import JoinGame from "./JoinGame";

const pages = {
  SETUP: 0,
  WAITING: 1,
  JOIN: 2,
};

export default function SetupMultiplayer(props) {
  // const [roomCode, setRoomCode] = useState("");
  let roomCode = "";
  const [page, SetPage] = useState(pages.SETUP);
  const navigate = useNavigate();

  function SetupPage() {
    async function handleCreateButtonClicked() {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };
      fetch("/api/multiplayer/create", requestOptions)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Request Failed");
          }
          return res.json();
        })
        .then((obj) => {
          if (obj.hasOwnProperty("code")) {
            roomCode = obj.code;
            navigate("/play-multiplayer", { state: { code: obj.code } });
          }
        })
        .catch((err) => console.error(err));
    }
    return (
      <form align="center">
        <Grid container spacing={1}>
          <Grid item xs={12} align="center">
            <Typography variant="h4" component="h4">
              Setup
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <ButtonGroup variant="contained">
              <Button
                color="primary"
                onClick={(e) => {
                  SetPage(pages.JOIN);
                }}
              >
                Join Game
              </Button>
              <Button color="success" onClick={handleCreateButtonClicked}>
                Create Game
              </Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={12} align="center">
            <Button color="error" variant="contained" to="/" component={Link}>
              Back
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }

  return page == pages.SETUP ? (
    SetupPage()
  ) : page == pages.JOIN ? (
    <JoinGame callbackForReturn={() => SetPage(pages.SETUP)} />
  ) : (
    <div>Room Code is {roomCode}</div>
  );
}
