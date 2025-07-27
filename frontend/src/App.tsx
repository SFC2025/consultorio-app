import React from "react";
import { Routes, Route } from "react-router-dom";
import Registro from "./Registro";
import PanelProfesional from "./pages/PanelProfesional";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Registro />} />
      <Route path="/panelprofesional" element={<PanelProfesional />} />
    </Routes>
  );
}

export default App;
