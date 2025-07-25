import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import PanelProfesional from "./pages/PanelProfesional.tsx"; 
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/profesionales" element={<PanelProfesional />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
