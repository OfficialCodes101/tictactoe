import React from "react";
import { Grid, Typography, Button, ButtonGroup } from "@mui/material";
import { Link } from "react-router-dom";

export default function Homepage(props) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} align="center">
        <Typography variant="h3" component="h3">
          Tic-Tac-Toe
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <ButtonGroup variant="contained">
          <Button color="primary" to="/setup" component={Link}>
            Play Computer
          </Button>
          <Button color="secondary">Play Friend</Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  );
}
