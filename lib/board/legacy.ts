import { findFont } from "../fonts";
import { readJson } from "../storage";
import type { Point, Rect, ShapeItem, StickerItem, Stroke, TextItem } from "../types";
import { newId } from "../utils";

/*
 * Boards saved before items had ids and a shared Rect layout. Each importer reads its old key
 * once, hands the converted records to the current collection and removes the old key.
 */

type LegacyStroke = { penColor: string; width: number; tool: "pen" | "rubber"; points: Point[] };
type LegacyText = { color: string; font: string; fontSize: number; value: string; points: Point[] };
type LegacyBox = { left: number; top: number; width: number; height: number };
type LegacyShape = LegacyBox & Pick<ShapeItem, "type" | "color" | "borderWidth" | "borderStyle">;
type LegacySticker = LegacyBox & { src: string };

function legacyImporter<S, T>(key: string, convert: (record: S) => Omit<T, "id">) {
  return (): T[] | undefined => {
    const saved = readJson(key);
    if (!Array.isArray(saved)) return undefined;
    localStorage.removeItem(key);
    return saved.map((record) => ({ id: newId(), ...convert(record as S) }) as T);
  };
}

const legacyRect = (box: LegacyBox): Rect => ({ x: box.left, y: box.top, width: box.width, height: box.height });

export const importLegacyStrokes = legacyImporter<LegacyStroke, Stroke>("strokes", (stroke) => ({
  tool: stroke.tool === "rubber" ? "eraser" : "pen",
  color: stroke.penColor,
  width: stroke.width,
  points: stroke.points,
}));

export const importLegacyTexts = legacyImporter<LegacyText, TextItem>("textStrokes", (text) => ({
  x: text.points[0]?.x ?? 0,
  y: text.points[0]?.y ?? 0,
  value: text.value,
  color: text.color,
  fontSize: text.fontSize,
  // Fonts used to be stored as CSS families; only the ones still offered keep their name.
  font: findFont(text.font).name,
}));

export const importLegacyShapes = legacyImporter<LegacyShape, ShapeItem>("shapeStrokes", (shape) => ({
  ...legacyRect(shape),
  type: shape.type,
  color: shape.color,
  borderWidth: shape.borderWidth,
  borderStyle: shape.borderStyle,
}));

export const importLegacyStickers = legacyImporter<LegacySticker, StickerItem>("stickerStrokes", (sticker) => ({
  ...legacyRect(sticker),
  src: sticker.src,
}));
