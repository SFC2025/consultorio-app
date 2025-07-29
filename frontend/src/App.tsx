import { Routes, Route, Navigate } from "react-router-dom";
import Registro from "./Registro";
import PanelProfesional from "./pages/PanelProfesional";
import { ProfesionalProvider } from "./context/ProfesionalContexto";
import { useEffect, useState } from "react";

function App() {
  return (
    <ProfesionalProvider>
      <Routes>
        <Route path="/" element={<Registro />} />
        <Route path="/panelprofesional" element={<PanelProfesional />} />
      </Routes>
    </ProfesionalProvider>
  );
}

export default App;
