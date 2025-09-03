import { Routes, Route } from "react-router-dom";
import Registro from "./Registro";
import PanelProfesional from "./pages/PanelProfesional";
import AgendaDiaria from "./pages/AgendaDiaria";
import { ProfesionalProvider } from "./context/ProfesionalContexto";
import Navbar from "./components/Navbar";      
          

function App() {
  return (
    <ProfesionalProvider>
      <Navbar />                                        
      <Routes>
        <Route path="/" element={<Registro />} />
        <Route path="/panelprofesional" element={<PanelProfesional />} />
        <Route path="/agenda" element={<AgendaDiaria />} />
      </Routes>
    </ProfesionalProvider>
  );
}

export default App;
