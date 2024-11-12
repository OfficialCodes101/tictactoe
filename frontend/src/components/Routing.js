import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import SetupComputer from "./computer/Setup";
import PlayComputer from "./computer/Play";
import SetupMultiplayer from "./multiplayer/Setup";
import PlayMultiplayer from "./multiplayer/Play";

export default function Routing(props) {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Homepage}></Route>
        <Route path="/setup-computer" Component={SetupComputer}></Route>
        <Route path="/play-computer" Component={PlayComputer}></Route>
        <Route path="/setup-multiplayer" Component={SetupMultiplayer}></Route>
        <Route path="/play-multiplayer" Component={PlayMultiplayer}></Route>
      </Routes>
    </Router>
  );
}
