import React, { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

type ProfesionalContextType = {
  profesionalesActivos: string[];
};

const ProfesionalContexto = createContext<ProfesionalContextType | null>(null);

const ProfesionalProvider = ({ children }: { children: ReactNode }) => {
  const [profesionalesActivos] = useState<string[]>([
    "Gonzalo Ambrosini - Kinesiólogo",
    "Ignacio Sagardoy - Kinesiólogo",
    "María Victoria De Angelis - Nutricionista",
    "Jose Maximino - Quiropráctico",
  ]);

  return (
    <ProfesionalContexto.Provider value={{ profesionalesActivos }}>
      {children}
    </ProfesionalContexto.Provider>
  );
};

export { ProfesionalContexto, ProfesionalProvider };
