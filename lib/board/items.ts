import { SHAPE_DEFAULTS } from "../constants";
import type { PlacedSticker, Point, Rect, ShapeItem, ShapeStyle, Sticker, StickerItem, Stroke, TextItem, TextStyle } from "../types";
import { newId } from "../utils";
import { centeredRect } from "./geometry";

/** Stroke points are stored to 1/100 of a board unit: invisible even at max zoom, and about half the storage. */
const roundPoint = (point: Point): Point => ({
  x: Math.round(point.x * 100) / 100,
  y: Math.round(point.y * 100) / 100,
});

export function makeStroke(tool: Stroke["tool"], color: string, width: number, start: Point): Stroke {
  return { id: newId(), order: Date.now(), tool, color, width, points: [roundPoint(start)] };
}

export function appendPoint(stroke: Stroke, point: Point): Stroke {
  return { ...stroke, points: [...stroke.points, roundPoint(point)] };
}

export function makeText(at: Point, style: TextStyle): TextItem {
  return { id: newId(), ...at, value: "", ...style };
}

export function makeShape(rect: Rect, style: ShapeStyle): ShapeItem {
  return { id: newId(), order: Date.now(), ...rect, ...style, ...SHAPE_DEFAULTS };
}

/** Where a sticker lands when placed with the pointer at `center`; also used for the hover preview. */
export function placeSticker(center: Point, sticker: Sticker): PlacedSticker {
  return { ...centeredRect(center, sticker), src: sticker.src };
}

export function makeSticker(center: Point, sticker: Sticker): StickerItem {
  return { id: newId(), ...placeSticker(center, sticker) };
}
