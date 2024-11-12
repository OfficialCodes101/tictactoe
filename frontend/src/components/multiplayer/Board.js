import React from "react";
import { Grid, Button } from "@mui/material";

export default function Board(props) {
  function getClassName(index) {
    if (props.pattern.includes(index)) {
      if (props.winner === props.data.shape) {
        return "green";
      } else if (props.winner === props.data.opponentShape) {
        return "red";
      }
    }
  }
  return (
    <Grid container spacing={0.5}>
      {props.board.map((move, index) => {
        return (
          <Grid
            item
            xs={4}
            align="center"
            className={`board-cell button-${index} ${getClassName(index)}`}
            key={index}
          >
            <Button
              variant="contained"
              disableElevation
              className={
                props.disabledButtons[index] ||
                props.turn === props.data.opponentShape
                  ? "board-button disabled-button"
                  : "board-button"
              }
              fullWidth
              onClick={() => props.playMoveCallback(index)}
            >
              {move}
            </Button>
          </Grid>
        );
      })}
    </Grid>
  );
}
