import { createContext, useContext, useState } from "react";

type ColorContextType = {
  font: string;
  setFont: (p: string) => void;
  fontSize: number;
  setFontSize: (p: number) => void;
};

const FontContext = createContext<ColorContextType | undefined>(undefined);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFont] = useState("font-normal");
  const [fontSize, setFontSize] = useState(20);
  return (
    <FontContext.Provider
      value={{
        font,
        setFont,
        fontSize,
        setFontSize,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const ctx = useContext(FontContext);
  if (!ctx) throw new Error("useFont must be used inside <FontProvider>");
  return ctx;
}
