import { Routes, Route, Navigate } from "react-router-dom";
import Registro from "./Registro";
import PanelProfesional from "./pages/PanelProfesional";
import { ProfesionalProvider } from "./context/ProfesionalContexto";
import { useEffect, useState } from "react";

function App() {
  const [estaLogueado, setEstaLogueado] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("accesoPermitido") === "true") {
      setEstaLogueado(true);
    }
  }, []);

  return (
    <ProfesionalProvider>
      <Routes>
        <Route path="/" element={<Registro />} />
        <Route
          path="/panelprofesional"
          element={
            estaLogueado ? <PanelProfesional /> : <Navigate to="/" />
          }
        />
      </Routes>
    </ProfesionalProvider>
  );
}

export default App;
