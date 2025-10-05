"use client";

import Canva from "@/components/canva/page";
import { useState } from "react";
import PenToolbar from "@/components/PenToolbar";
import { ColorProvider } from "@/lib/utils/useColorContext";
import ToolBar from "@/components/ToolBar";
import Cursor from "@/components/Cursor";
import RubberToolbar from "@/components/RubberToolbar";

export default function Home() {
  const [draw, setDraw] = useState(false);
  const [drawIn, setDrawIn] = useState(false);
  const [rabOut, setRabOut] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(12);
  const [tool, setTool] = useState<"pen" | "rubber" | "other">("other");

  const [showCustom, setShowCustom] = useState(true);
  return (
    <ColorProvider>
      {showCustom && (
        <Cursor
          size={brushSize}
          draw={draw}
        />
      )}

      {drawIn && (
        <PenToolbar
          brushSize={brushSize}
          setBrushSize={setBrushSize}
        />
      )}

      {rabOut && (
        <RubberToolbar
          brushSize={brushSize}
          setBrushSize={setBrushSize}
        />
      )}

      <ToolBar
        draw={draw}
        setDraw={setDraw}
        drawIn={drawIn}
        setDrawIn={setDrawIn}
        rabOut={rabOut}
        setRabOut={setRabOut}
        tool={tool}
        setTool={setTool}
      />

      <Canva
        draw={draw}
        brushSize={brushSize}
        tool={tool}
        setDrawIn={setDrawIn}
        setRabOut={setRabOut}
        showCustom={showCustom}
        setShowCustom={setShowCustom}
      />
    </ColorProvider>
  );
}
