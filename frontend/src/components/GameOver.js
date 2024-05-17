import React from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Button, Typography, ButtonGroup } from "@mui/material";

export default function GameOver(props) {
  const navigate = useNavigate();

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        {props.data.winner === "user" ? (
          <Typography variant="h4" component="h4">
            You Win
          </Typography>
        ) : (
          <Typography variant="h4" component="h4">
            You Lose
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} align="center">
        <ButtonGroup>
          <Button
            variant="contained"
            color="success"
            onClick={async (e) => {
              await props.boardWinnerCallback();
            }}
          >
            Play Again
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              navigate("/setup");
            }}
          >
            Change Difficulty
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={props.leaveGameCallback}
          >
            Main Menu
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  );
}
