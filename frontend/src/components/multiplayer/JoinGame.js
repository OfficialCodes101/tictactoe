import React, { useState } from "react";
import { Grid, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function JoinGame(props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  function handleTextFieldChange(e) {
    setCode(e.target.value);
  }

  function handleJoinButtonClicked(e) {
    const requestOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_code: code }),
    };

    fetch("/api/multiplayer/join", requestOptions)
      .then((res) => {
        return res.json();
      })
      .then((obj) => {
        if (obj.error) {
          setError(true);
          setErrorMessage(obj.error);
          console.error(obj.error);
        } else {
          navigate("/play-multiplayer", { state: { code } });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Join A Game
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <TextField
          label="Code"
          placeholder="Enter a Game Code"
          value={code}
          helperText={errorMessage}
          variant="outlined"
          error={error}
          onChange={handleTextFieldChange}
        />
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleJoinButtonClicked}
        >
          Join Game
        </Button>
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={props.callbackForReturn}
        >
          Back
        </Button>
      </Grid>
    </Grid>
  );
}
