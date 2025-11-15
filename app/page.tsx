"use client";

import Canva from "@/components/canva/page";
import { useState } from "react";
import PenToolbar from "@/components/PenToolbar";
import { ColorProvider } from "@/lib/utils/useColorContext";
import ToolBar from "@/components/ToolBar";
import Cursor from "@/components/Cursor";
import RubberToolbar from "@/components/RubberToolbar";
import { FontProvider } from "@/lib/utils/useFontContext";
import StickerBar from "@/components/StickerToolbar";

export default function Home() {
  const [draw, setDraw] = useState(false);
  const [drawIn, setDrawIn] = useState(false);
  const [rabOut, setRabOut] = useState(false);
  const [stickerBar, setStickerBar] = useState(false);
  const [choosenSticker, setChoosenSticker] = useState("");
  const [stickerSize, setStickerSize] = useState<number[]>([]);
  const [brushSize, setBrushSize] = useState<number>(12);
  const [tool, setTool] = useState<
    "pen" | "rubber" | "text" | "sticker" | "other"
  >("other");

  const [showCustom, setShowCustom] = useState(true);

  const [clearAll, setClearAll] = useState(false);

  return (
    <ColorProvider>
      <FontProvider>
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

        {stickerBar && (
          <StickerBar
            choosenSticker={choosenSticker}
            setStickerSize={setStickerSize}
            setChoosenSticker={setChoosenSticker}
          />
        )}

        <ToolBar
          draw={draw}
          setDraw={setDraw}
          drawIn={drawIn}
          setDrawIn={setDrawIn}
          rabOut={rabOut}
          setRabOut={setRabOut}
          stickerBar={stickerBar}
          setStickerBar={setStickerBar}
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
          stickerBar={stickerBar}
          choosenSticker={choosenSticker}
          clearAll={clearAll}
          setClearAll={setClearAll}
          stickerSize={stickerSize}
        />
      </FontProvider>
    </ColorProvider>
  );
}
