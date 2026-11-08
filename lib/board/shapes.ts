import type { Point as BoardPoint, Rect, ShapeType } from "../types";
import { contains } from "./geometry";

type Point = [number, number];
type ShapeOutline = Rect & { type: ShapeType };

/** Outline of a shape filling a `width` x `height` box, as SVG path data. */
export function shapePath(type: ShapeType, width: number, height: number): string {
  const w = width;
  const h = height;
  switch (type) {
    case "square":
      return polygon([[0, 0], [w, 0], [w, h], [0, h]]);
    case "circle":
      return `M ${f(w / 2)} 0 A ${f(w / 2)} ${f(h / 2)} 0 1 1 ${f(w / 2)} ${f(h)} A ${f(w / 2)} ${f(h / 2)} 0 1 1 ${f(w / 2)} 0 Z`;
    case "rhombus":
      return polygon([[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]]);
    case "triangle":
      return polygon([[w / 2, 0], [w, h], [0, h]]);
    case "hexagon":
      return polygon([[w / 4, 0], [(3 * w) / 4, 0], [w, h / 2], [(3 * w) / 4, h], [w / 4, h], [0, h / 2]]);
    case "star":
      return polygon(fitToBox(starPoints(), w, h));
    case "arrow":
      return polygon([[0, h / 4], [0.6 * w, h / 4], [0.6 * w, 0], [w, h / 2], [0.6 * w, h], [0.6 * w, (3 * h) / 4], [0, (3 * h) / 4]]);
    case "heart":
      return heartPath(w, h);
  }
}

const f = (n: number) => String(Math.round(n * 100) / 100);

const polygon = (points: Point[]) =>
  points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${f(x)} ${f(y)}`).join(" ") + " Z";

/** Five-pointed star on a unit circle, tip up. */
function starPoints(): Point[] {
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? 1 : 0.4;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
  });
}

/** Stretches a point set so its bounding box becomes exactly `width` x `height`. */
function fitToBox(points: Point[], width: number, height: number): Point[] {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX;
  const spanY = Math.max(...ys) - minY;
  return points.map(([x, y]) => [((x - minX) / spanX) * width, ((y - minY) / spanY) * height]);
}

function heartPath(w: number, h: number) {
  const p = (x: number, y: number) => `${f(x * w)} ${f(y * h)}`;
  return [
    `M ${p(0.5, 1)}`,
    `C ${p(0.5, 1)} ${p(0, 0.68)} ${p(0, 0.32)}`,
    `C ${p(0, 0.12)} ${p(0.14, 0)} ${p(0.28, 0)}`,
    `C ${p(0.4, 0)} ${p(0.5, 0.1)} ${p(0.5, 0.22)}`,
    `C ${p(0.5, 0.1)} ${p(0.6, 0)} ${p(0.72, 0)}`,
    `C ${p(0.86, 0)} ${p(1, 0.12)} ${p(1, 0.32)}`,
    `C ${p(1, 0.68)} ${p(0.5, 1)} ${p(0.5, 1)} Z`,
  ].join(" ");
}

let hitContext: CanvasRenderingContext2D | null = null;

/** Whether a board point lies inside the shape's outline, not just its bounding box. */
export function shapeContains(shape: ShapeOutline, point: BoardPoint) {
  if (!contains(shape, point)) return false;
  hitContext ??= document.createElement("canvas").getContext("2d");
  // Without a 2D context (unlikely) the bounding box check above has to do.
  if (!hitContext) return true;
  const path = new Path2D(shapePath(shape.type, shape.width, shape.height));
  return hitContext.isPointInPath(path, point.x - shape.x, point.y - shape.y);
}
