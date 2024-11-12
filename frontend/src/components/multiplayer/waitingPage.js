import { Grid, Typography, CircularProgress } from "@mui/material";
import React from "react";

export default function WaitingPage(props) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" mt={3}>
          Game Code: {props.code}
        </Typography>
        <Typography variant="h6" mt={1}>
          You are {props.shapes.shape}. Waiting for other player...
        </Typography>
      </Grid>
      <Grid item align="center" xs={12}>
        <CircularProgress color="primary" size={60}></CircularProgress>
      </Grid>
    </Grid>
  );
}
