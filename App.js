// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Game from "./Game";
import MiniGame from "./MiniGame";
import DinoGame from "./DinoGame";   // 🟩 TREBUIE IMPORTAT

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/minigame" element={<MiniGame />} />
        <Route path="/dino" element={<DinoGame />} />   {/* 🟩 AICI ERA PROBLEMA */}
      </Routes>
    </Router>
  );
}

export default App;
