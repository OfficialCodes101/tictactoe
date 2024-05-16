import React from "react";
import { Grid, Button } from "@mui/material";

export default function Board(props) {
  function handleMove(buttonIndex) {
    props.boardMoveCallback(buttonIndex);
  }

  return (
    <Grid container spacing={0.5}>
      {props.board.map((move, index) => {
        return (
          <Grid item xs={4} align="center" className="board-cell" key={index}>
            <Button
              variant="contained"
              disableElevation
              className={
                props.disabledButtons[index] || 
                props.turn === props.computerShape 
                  ? "board-button disabled-button" 
                  : "board-button"
              }
              fullWidth
              onClick={() => handleMove(index)}
            >
              {move}
            </Button>
          </Grid>
        );
      })}
    </Grid>
  );
}
