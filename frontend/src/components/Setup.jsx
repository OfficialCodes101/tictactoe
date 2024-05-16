import {
  FormHelperText,
  Grid,
  RadioGroup,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";

const pages = {
  SETUP: 0,
  PROCEED: 1,
};

export default function Setup(props) {
  const defaultDifficulty = "medium";
  const [difficulty, setDifficulty] = useState(defaultDifficulty);
  const [page, setPage] = useState(pages.SETUP);
  const [data, setData] = useState({ data: {} });

  const navigate = useNavigate();
  function handleRadioChange(e) {
    setDifficulty(e.target.value);
  }

  function handleFinishSetup(e) {
    e.preventDefault();
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty }),
    };
    fetch("/api/setup", requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        setPage(pages.PROCEED);
        setData({ data: data });
      });
  }

  function setupPage() {
    return (
      <form onSubmit={handleFinishSetup} align="center">
        <Grid container spacing={1}>
          <Grid item xs={12} align="center">
            <Typography variant="h4" component="h4">
              Setup
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <FormControl component="fieldset">
              <FormHelperText
                style={{
                  margin: "auto",
                  textAlign: "center",
                }}
              >
                Select Difficulty
              </FormHelperText>
              <RadioGroup value={difficulty} onChange={handleRadioChange}>
                <FormControlLabel
                  value="easy"
                  control={<Radio color="success" />}
                  label="Easy"
                />
                <FormControlLabel
                  value="medium"
                  control={<Radio color="warning" />}
                  label="Medium"
                />
                <FormControlLabel
                  value="hard"
                  control={<Radio color="error" />}
                  label="Hard"
                />
                <FormControlLabel
                  value="impossible"
                  control={<Radio color="secondary" />}
                  label="Impossible"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} align="center">
            <Button type="submit" color="success" variant="contained">
              Finish Setup
            </Button>
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

  function proceedPage() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            {console.log(
              data.data.player_shape,
              data.data.turn,
              data.data.computer_shape
            )}
            {data.data.player_shape === data.data.turn
              ? `You are ${data.data.player_shape}, the first move is yours`
              : `You are ${data.data.player_shape}, Computer goes first`}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Difficulty: {data.data.difficulty}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="success"
            to="/play"
            component={Link}
          >
            Play Now
          </Button>
        </Grid>
      </Grid>
    );
  }

  if (page === pages.SETUP) {
    return setupPage();
  } else if (page === pages.PROCEED) {
    return proceedPage();
  }
}
