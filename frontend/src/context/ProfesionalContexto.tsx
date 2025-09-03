import { createContext, useEffect, useState, type ReactNode } from "react";

type ProfesionalContextType = {
  profesionalesActivos: string[];
  selectedProfesional: string;
  setSelectedProfesional: (s: string) => void;
};

export const ProfesionalContexto = createContext<ProfesionalContextType | null>(
  null
);

export const ProfesionalProvider = ({ children }: { children: ReactNode }) => {
  const [profesionalesActivos] = useState<string[]>([
    "Gonzalo Ambrosini - Kinesiólogo",
    "Ignacio Sagardoy - Kinesiólogo",
    "María Victoria De Angelis - Nutricionista",
    "Jose Maximino - Quiropráctico",
  ]);

  const [selectedProfesional, setSelectedProfesional] = useState<string>(() => {
    return localStorage.getItem("selectedProfesional") || "";
  });

  useEffect(() => {
    localStorage.setItem("selectedProfesional", selectedProfesional);
  }, [selectedProfesional]);

  return (
    <ProfesionalContexto.Provider
      value={{
        profesionalesActivos,
        selectedProfesional,
        setSelectedProfesional,
      }}
    >
      {children}
    </ProfesionalContexto.Provider>
  );
};
