import { DEFAULT_FONT } from "./fonts";
import type { BorderStyle, ShapeItem, Size, Sticker, Tool, ToolSettings } from "./types";

export const ZOOM = { min: 0.2, max: 5, sensitivity: 0.003 };
export const BRUSH_SIZE = { min: 1, max: 60 };
export const FONT_SIZE = { min: 1, max: 120 };
/** Drags smaller than this (in board units) are treated as clicks, not shapes. */
export const MIN_SHAPE_SIZE = 2;

/**
 * Per-tool behaviour: what the tool's secondary toolbar does once drawing starts ("sticky" ones
 * stay open because the tool needs them), and what follows the pointer while hovering.
 */
export const TOOLS: Record<Tool, { panel: "none" | "transient" | "sticky"; hoverPreview?: "brush" | "sticker" }> = {
  select: { panel: "none" },
  pen: { panel: "transient", hoverPreview: "brush" },
  eraser: { panel: "transient", hoverPreview: "brush" },
  text: { panel: "none" },
  shape: { panel: "transient" },
  sticker: { panel: "sticky", hoverPreview: "sticker" },
};

export const DEFAULT_SETTINGS: ToolSettings = {
  brushSize: 12,
  penColor: "#000000",
  shape: { type: "square", color: "#000000" },
  text: { color: "#000000", font: DEFAULT_FONT, fontSize: 20 },
  sticker: null,
};

export const SHAPE_DEFAULTS: Pick<ShapeItem, "borderWidth" | "borderStyle"> = {
  borderWidth: 0,
  borderStyle: "solid",
};

export const PEN_PALETTE: { fill: string; border: string }[] = [
  { fill: "#000000", border: "#000000" },
  { fill: "#D7000F", border: "#B1030F" },
  { fill: "#FF6A00", border: "#D05700" },
  { fill: "#FFD900", border: "#DDBC00" },
  { fill: "#9FF32A", border: "#7ACE04" },
  { fill: "#22C4FF", border: "#0A9CD2" },
  { fill: "#1301B8", border: "#0D0081" },
  { fill: "#FFFFFF", border: "#B3B3B3" },
];

export const BORDER_WIDTHS = [12, 8, 4, 0];
export const BORDER_STYLES: BorderStyle[] = ["solid", "dashed", "dotted"];

/**
 * Sticker catalog in clockwise order around the sticker wheel, starting at the
 * top-left slot. `thumb` is the size shown in the wheel.
 */
export const STICKERS: (Sticker & { thumb: Size })[] = [
  { name: "Yes", src: "/yes2.png", width: 140, height: 62.5, thumb: { width: 70, height: 30 } },
  { name: "No", src: "/no.png", width: 140, height: 62.5, thumb: { width: 60, height: 30 } },
  { name: "Thumbs down", src: "/handDown.png", width: 100, height: 100, thumb: { width: 50, height: 80 } },
  { name: "Speech mark", src: "/blablamark.png", width: 70, height: 90, thumb: { width: 40, height: 100 } },
  { name: "Star", src: "/star.png", width: 100, height: 100, thumb: { width: 55, height: 100 } },
  { name: "Heart", src: "/heartEmote.png", width: 100, height: 100, thumb: { width: 55, height: 100 } },
  { name: "Thumbs up", src: "/handUp.png", width: 100, height: 100, thumb: { width: 50, height: 80 } },
  { name: "Question mark", src: "/questionMark.png", width: 80, height: 80, thumb: { width: 40, height: 100 } },
];
