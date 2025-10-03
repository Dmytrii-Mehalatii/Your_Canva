import { createContext, useContext, useState } from "react";

type ColorContextType = {
  color: string;
  setColor: (p: string) => void;
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState("#000");

  return (
    <ColorContext.Provider value={{ color, setColor }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error("useColor must be used inside <ColorProvider>");
  return ctx;
}
