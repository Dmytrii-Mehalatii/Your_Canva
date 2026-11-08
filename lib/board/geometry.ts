import { ZOOM } from "../constants";
import type { Point, Rect, Size, Viewport } from "../types";
import { clamp } from "../utils";

export function screenToBoard(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.x) / viewport.scale,
    y: (point.y - viewport.y) / viewport.scale,
  };
}

export function pointToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: point.x * viewport.scale + viewport.x,
    y: point.y * viewport.scale + viewport.y,
  };
}

export function rectToScreen(rect: Rect, viewport: Viewport): Rect {
  return {
    ...pointToScreen(rect, viewport),
    width: rect.width * viewport.scale,
    height: rect.height * viewport.scale,
  };
}

export function contains(rect: Rect, point: Point) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function rectFromPoints(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

export function centeredRect(center: Point, { width, height }: Size): Rect {
  return { x: center.x - width / 2, y: center.y - height / 2, width, height };
}

/** Zooms by a wheel delta while keeping the board point under `focus` fixed on screen. */
export function zoomViewport(viewport: Viewport, focus: Point, deltaY: number): Viewport {
  const scale = clamp(viewport.scale - deltaY * ZOOM.sensitivity, ZOOM.min, ZOOM.max);
  const ratio = scale / viewport.scale;
  return {
    scale,
    x: focus.x - (focus.x - viewport.x) * ratio,
    y: focus.y - (focus.y - viewport.y) * ratio,
  };
}
