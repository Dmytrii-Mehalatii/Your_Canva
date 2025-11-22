import { createContext, useContext, useState } from "react";

type ShapeContextType = {
  type: string;
  setType: (p: string) => void;
};

const ShapeContext = createContext<ShapeContextType | undefined>(undefined);

export function ShapeTypeProvider({ children }: { children: React.ReactNode }) {
  const [type, setType] = useState("square");
  return (
    <ShapeContext.Provider
      value={{
        type,
        setType,
      }}
    >
      {children}
    </ShapeContext.Provider>
  );
}

export function useShape() {
  const ctx = useContext(ShapeContext);
  if (!ctx) throw new Error("useFont must be used inside <FontProvider>");
  return ctx;
}
