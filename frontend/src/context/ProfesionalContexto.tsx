import { createContext, useState, type ReactNode } from "react";

type ProfesionalContextType = {
  profesionalesActivos: string[];
};

export const ProfesionalContexto = createContext<ProfesionalContextType | null>(null);

export const ProfesionalProvider = ({ children }: { children: ReactNode }) => {
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
