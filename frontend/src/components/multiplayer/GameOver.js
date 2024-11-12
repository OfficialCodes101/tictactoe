import { useNavigate } from "react-router-dom";
import {
  Button,
  Grid,
  Typography,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import React from "react";

export default function GameOver(props) {
  const navigate = useNavigate();
  let resultText;
  if (!props.oppConnected && !props.data.fromConnect) {
    resultText = "Opponent left";
  } else if (props.data.winner === props.shape) {
    resultText = "You Win";
  } else {
    resultText = "You Lost";
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <RematchDialog
          open={props.data.showRematchDialog && props.oppConnected}
          onConfirm={props.dialogOnConfirmCallback}
          onCancel={props.dialogOnCancelCallback}
        />
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h5" component="h5">
          {resultText}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <ButtonGroup>
          <Button
            variant="contained"
            color="primary"
            onClick={props.rematchCallback}
            disabled={!props.oppConnected}
          >
            Rematch
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              navigate("/");
            }}
          >
            Main Menu
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  );
}

function RematchDialog({ open, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Opponent wants a rematch. Accept?</DialogTitle>
      <DialogActions>
        <Button onClick={onConfirm} color="primary">
          Yes
        </Button>
        <Button onClick={onCancel} color="error">
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
}
