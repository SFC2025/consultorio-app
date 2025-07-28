import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ProfesionalProvider } from "./context/ProfesionalContexto";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
  <ProfesionalProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ProfesionalProvider>
</React.StrictMode>
);
