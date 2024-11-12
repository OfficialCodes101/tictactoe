import { CircularProgress, Grid } from "@mui/material";
import React from "react";

export default function BlankWaitingPage(props) {
  return (
    <Grid container>
      <Grid item xs={12} align="center">
        <CircularProgress color="primary" size={70}></CircularProgress>
      </Grid>
    </Grid>
  );
}
