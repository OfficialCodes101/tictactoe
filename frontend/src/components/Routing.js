import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import Setup from "./Setup";
import Play from "./Play";

export default function Routing(props) {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Homepage}></Route>
        <Route path="/setup" Component={Setup}></Route>
        <Route path="/play" Component={Play}></Route>
      </Routes>
    </Router>
  );
}
