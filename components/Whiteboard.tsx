"use client";

import { useState } from "react";
import { DEFAULT_SETTINGS, TOOLS } from "@/lib/constants";
import { useBoard } from "@/lib/hooks/useBoard";
import type { ShapeStyle, TextStyle, Tool, ToolSettings } from "@/lib/types";
import Canvas from "./canvas/Canvas";
import EraserToolbar from "./toolbar/EraserToolbar";
import PenToolbar from "./toolbar/PenToolbar";
import ShapeSettings from "./toolbar/ShapeSettings";
import ShapesToolbar from "./toolbar/ShapesToolbar";
import StickerToolbar from "./toolbar/StickerToolbar";
import TextSettings from "./toolbar/TextSettings";
import ToolBar from "./toolbar/ToolBar";

export default function Whiteboard() {
  const board = useBoard();
  const [tool, setTool] = useState<Tool>("select");
  const [panelOpen, setPanelOpen] = useState(false);
  const [settings, setSettings] = useState<ToolSettings>(DEFAULT_SETTINGS);

  /** The secondary toolbar currently shown, if the active tool has one. */
  const panel = panelOpen && TOOLS[tool].panel !== "none" ? tool : null;

  const updateSettings = (patch: Partial<ToolSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const updateShapeStyle = (patch: Partial<ShapeStyle>) =>
    setSettings((current) => ({ ...current, shape: { ...current.shape, ...patch } }));
  const updateTextStyle = (patch: Partial<TextStyle>) =>
    setSettings((current) => ({ ...current, text: { ...current.text, ...patch } }));

  // Picking a tool opens its toolbar; picking the active tool again just toggles the toolbar.
  const selectTool = (next: Tool) => {
    setPanelOpen(next !== tool || !panelOpen);
    setTool(next);
  };

  const handleCanvasPointerDown = () => {
    if (TOOLS[tool].panel === "transient") setPanelOpen(false);
  };

  const { selected } = board;

  const updateSelectedText = (patch: Partial<TextStyle>) => {
    if (selected?.kind !== "text") return;
    board.texts.update(selected.item.id, patch);
    // The text tool has no toolbar of its own, so new text boxes reuse the style set most recently.
    updateTextStyle(patch);
  };

  return (
    <>
      <Canvas tool={tool} settings={settings} board={board} onPointerDown={handleCanvasPointerDown} />

      {selected?.kind === "shape" && (
        <ShapeSettings
          key={selected.item.id}
          shape={selected.item}
          onChange={(patch) => board.shapes.update(selected.item.id, patch)}
          onDelete={board.deleteSelected}
        />
      )}
      {selected?.kind === "text" && (
        <TextSettings key={selected.item.id} text={selected.item} onChange={updateSelectedText} onDelete={board.deleteSelected} />
      )}

      {panel === "pen" && (
        <PenToolbar
          brushSize={settings.brushSize}
          color={settings.penColor}
          onBrushSizeChange={(brushSize) => updateSettings({ brushSize })}
          onColorChange={(penColor) => updateSettings({ penColor })}
        />
      )}
      {panel === "eraser" && (
        <EraserToolbar
          brushSize={settings.brushSize}
          onBrushSizeChange={(brushSize) => updateSettings({ brushSize })}
          onClearAll={board.clearAll}
        />
      )}
      {panel === "shape" && <ShapesToolbar shape={settings.shape} onChange={updateShapeStyle} />}
      {panel === "sticker" && <StickerToolbar selected={settings.sticker} onSelect={(sticker) => updateSettings({ sticker })} />}

      <ToolBar tool={tool} panel={panel} penColor={settings.penColor} onSelectTool={selectTool} />
    </>
  );
}
