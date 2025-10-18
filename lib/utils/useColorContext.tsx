import { createContext, useContext, useState } from "react";

type ColorContextType = {
  color: string;
  setColor: (p: string) => void;
  scale: number;
  setScale: (p: number) => void;
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState("#000");
  const [scale, setScale] = useState(1);
  return (
    <ColorContext.Provider value={{ color, setColor, scale, setScale }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error("useColor must be used inside <ColorProvider>");
  return ctx;
}
