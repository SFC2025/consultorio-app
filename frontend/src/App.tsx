import { Routes, Route, Navigate } from "react-router-dom";
import Registro from "./Registro";
import PanelProfesional from "./pages/PanelProfesional";
import { ProfesionalProvider } from "./context/ProfesionalContexto";
import { useEffect, useState } from "react";

function App() {
  const [estaLogueado, setEstaLogueado] = useState<boolean | null>(null);

  useEffect(() => {
    const acceso = localStorage.getItem("accesoPermitido");
    setEstaLogueado(acceso === "true");
  }, []);

  if (estaLogueado === null) return null; // o un loader si querés

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
