import { createContext, useContext, useState } from "react";

type ColorContextType = {
  penColor: string;
  setPenColor: (p: string) => void;
  textColor: string;
  setTextColor: (p: string) => void;
  shapeColor: string;
  setShapeColor: (p: string) => void;
  scale: number;
  setScale: (p: number) => void;
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [penColor, setPenColor] = useState("#000");
  const [textColor, setTextColor] = useState("#000");
  const [shapeColor, setShapeColor] = useState("#000");
  const [scale, setScale] = useState(1);
  return (
    <ColorContext.Provider
      value={{
        penColor,
        setPenColor,
        textColor,
        setTextColor,
        scale,
        setScale,
        shapeColor,
        setShapeColor,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error("useColor must be used inside <ColorProvider>");
  return ctx;
}
