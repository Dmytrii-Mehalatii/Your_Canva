"use client";

import Canva from "@/components/canva/page";
import { useState } from "react";
import PenToolbar from "@/components/PenToolbar";
import { ColorProvider } from "@/lib/utils/useColorContext";
import ToolBar from "@/components/ToolBar";
import Cursor from "@/components/Cursor";
import RubberToolbar from "@/components/RubberToolbar";
import Image from "next/image";

export default function Home() {
  const [draw, setDraw] = useState(false);
  const [drawIn, setDrawIn] = useState(false);
  const [rabOut, setRabOut] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(12);
  const [tool, setTool] = useState<"pen" | "rubber" | "text" | "other">(
    "other"
  );

  const [showCustom, setShowCustom] = useState(true);

  const [clearAll, setClearAll] = useState(false);

  const [mapSrc, setMapSrc] = useState<string | null>(null);
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
          setClearAll={setClearAll}
        />
      )}

      {mapSrc && (
        <div className="absolute top-4 right-4 rounded-lg overflow-hidden bg-white shadow-[0_2px_4px_0_rgba(255,192,196,1)]">
          <Image
            src={`${mapSrc}`}
            alt="whiteboard map"
            width={300}
            height={160}
            className=" object-contain"
          />
        </div>
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
        clearAll={clearAll}
        setClearAll={setClearAll}
        setMapSrc={setMapSrc}
      />
    </ColorProvider>
  );
}
