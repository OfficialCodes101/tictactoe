import React from "react";
import { Grid, Collapse, Alert } from "@mui/material";

export default function ErrorAlert(props) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Collapse in={props.showError}>
          <Alert severity="error">{props.errorMessage}</Alert>
        </Collapse>
      </Grid>
    </Grid>
  );
}
