import React from "react";
import { Grid, Typography, Alert, Collapse } from "@mui/material";

export default function GameAlert(props) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Collapse in={props.alertActive}>
          <Alert severity="error">Trying to reconnect....</Alert>
        </Collapse>
      </Grid>
    </Grid>
  );
}
