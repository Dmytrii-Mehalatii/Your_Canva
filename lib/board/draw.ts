import type { BorderStyle, PlacedSticker, Rect, ShapeItem, ShapeStyle, Stroke, Viewport } from "../types";
import { shapePath } from "./shapes";

type Images = ReadonlyMap<string, HTMLImageElement>;
/** CSS size of the canvas plus the device pixel ratio that maps it to the backing store. */
export type CanvasSize = { width: number; height: number; dpr: number };

/** Everything that is painted permanently and can be erased: strokes and shapes, in one paint order. */
export type Ink = { strokes: Stroke[]; shapes: ShapeItem[] };

/** Everything drawn on top of the committed ink. */
export type Overlay = {
  currentStroke: Stroke | null;
  shapeDraft: (Rect & ShapeStyle) | null;
  stickers: PlacedSticker[];
  stickerPreview: PlacedSticker | null;
  images: Images;
};

type InkItem = { kind: "stroke"; stroke: Stroke } | { kind: "shape"; shape: ShapeItem };

/**
 * Paints the board onto a canvas. Committed ink is rasterized into an offscreen layer that is
 * reused while only the overlay changes, and extended in place when one item is appended, so a
 * stroke in progress costs one image copy rather than re-stroking every path on the board.
 */
export function createPainter() {
  const layer = document.createElement("canvas");
  let layerState: (Ink & { viewport: Viewport; size: CanvasSize }) | null = null;

  const rasterizeInk = (ink: Ink, viewport: Viewport, size: CanvasSize) => {
    const previous = layerState;
    layerState = { ...ink, viewport, size };
    const appended = previous?.viewport === viewport && previous.size === size ? appendedItem(previous, ink) : null;
    if (appended) {
      // The layer's context still carries the transform from its last full raster, and a new item
      // always has the highest order, so it can simply be drawn on top.
      const ctx = layer.getContext("2d");
      if (ctx) drawInkItem(ctx, appended);
      return;
    }
    const ctx = prepare(layer, size, viewport);
    if (!ctx) return;
    for (const item of inPaintOrder(ink)) drawInkItem(ctx, item);
  };

  return {
    paint(canvas: HTMLCanvasElement, size: CanvasSize, viewport: Viewport, ink: Ink, overlay: Overlay) {
      if (
        layerState?.strokes !== ink.strokes ||
        layerState.shapes !== ink.shapes ||
        layerState.viewport !== viewport ||
        layerState.size !== size
      ) {
        rasterizeInk(ink, viewport, size);
      }
      const ctx = prepare(canvas, size, viewport);
      if (!ctx) return;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(layer, 0, 0);
      ctx.restore();

      if (overlay.currentStroke) drawStroke(ctx, overlay.currentStroke);
      if (overlay.shapeDraft) drawShapeOutline(ctx, overlay.shapeDraft, 2 / viewport.scale);

      // Stickers sit above the ink and are never erased; they have their own delete control.
      ctx.globalCompositeOperation = "source-over";
      for (const sticker of overlay.stickers) drawSticker(ctx, sticker, overlay.images);
      if (overlay.stickerPreview) {
        ctx.globalAlpha = 0.5;
        drawSticker(ctx, overlay.stickerPreview, overlay.images);
        ctx.globalAlpha = 1;
      }
    },
  };
}

export type Painter = ReturnType<typeof createPainter>;

/** Strokes and shapes interleaved by creation. Items without an order (saved before it existed) paint first, shapes beneath strokes. */
function inPaintOrder({ strokes, shapes }: Ink): InkItem[] {
  const items: InkItem[] = [
    ...shapes.map((shape) => ({ kind: "shape" as const, shape })),
    ...strokes.map((stroke) => ({ kind: "stroke" as const, stroke })),
  ];
  return items.sort((a, b) => orderOf(a) - orderOf(b));
}

const orderOf = (item: InkItem) => (item.kind === "stroke" ? item.stroke.order : item.shape.order) ?? 0;

/** The single item added since `previous`, if that is the only difference. */
function appendedItem(previous: Ink, next: Ink): InkItem | null {
  if (next.shapes === previous.shapes && isAppend(previous.strokes, next.strokes)) {
    return { kind: "stroke", stroke: next.strokes[next.strokes.length - 1] };
  }
  if (next.strokes === previous.strokes && isAppend(previous.shapes, next.shapes)) {
    return { kind: "shape", shape: next.shapes[next.shapes.length - 1] };
  }
  return null;
}

function isAppend<T>(previous: T[], next: T[]) {
  return next.length === previous.length + 1 && previous.every((item, i) => next[i] === item);
}

/**
 * Sizes the backing store to the screen, clears it and applies the viewport transform in device
 * pixels. Returns null before the canvas has been measured: a 0x0 canvas cannot be drawn from.
 */
function prepare(canvas: HTMLCanvasElement, { width, height, dpr }: CanvasSize, viewport: Viewport) {
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (pixelWidth === 0 || pixelHeight === 0) return null;
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, pixelWidth, pixelHeight);
  const scale = viewport.scale * dpr;
  ctx.setTransform(scale, 0, 0, scale, viewport.x * dpr, viewport.y * dpr);
  return ctx;
}

function drawInkItem(ctx: CanvasRenderingContext2D, item: InkItem) {
  if (item.kind === "stroke") drawStroke(ctx, item.stroke);
  else drawShape(ctx, item.shape);
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const [first, ...rest] = stroke.points;
  if (!first) return;

  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = stroke.color;

  ctx.beginPath();
  if (rest.every((point) => point.x === first.x && point.y === first.y)) {
    // Browsers skip zero-length segments even with round caps, so a plain click is drawn as a disc.
    ctx.fillStyle = stroke.color;
    ctx.arc(first.x, first.y, stroke.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.moveTo(first.x, first.y);
  for (const point of rest) ctx.lineTo(point.x, point.y);
  ctx.stroke();
}

function drawShape(ctx: CanvasRenderingContext2D, shape: ShapeItem) {
  const { borderWidth } = shape;
  // The border is centered on the outline, so the outline is inset to keep the whole shape in its box.
  const path = new Path2D(shapePath(shape.type, Math.max(shape.width - borderWidth, 0), Math.max(shape.height - borderWidth, 0)));
  ctx.save();
  ctx.translate(shape.x + borderWidth / 2, shape.y + borderWidth / 2);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = shape.color;
  ctx.fill(path);
  if (borderWidth > 0) {
    ctx.lineWidth = borderWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.setLineDash(dashPattern(shape.borderStyle, borderWidth));
    ctx.stroke(path);
  }
  ctx.restore();
}

/** Outline of the shape being dragged out, `lineWidth` thick in board units. */
function drawShapeOutline(ctx: CanvasRenderingContext2D, draft: Rect & ShapeStyle, lineWidth: number) {
  const path = new Path2D(shapePath(draft.type, draft.width, draft.height));
  ctx.save();
  ctx.translate(draft.x, draft.y);
  ctx.globalCompositeOperation = "source-over";
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.strokeStyle = draft.color;
  ctx.stroke(path);
  ctx.restore();
}

function dashPattern(style: BorderStyle, width: number): number[] {
  if (style === "dashed") return [width * 3, width * 2];
  // Zero-length dashes with round caps render as dots.
  if (style === "dotted") return [0, width * 2];
  return [];
}

function drawSticker(ctx: CanvasRenderingContext2D, sticker: PlacedSticker, images: Images) {
  const image = images.get(sticker.src);
  if (image?.complete && image.naturalWidth > 0) {
    ctx.drawImage(image, sticker.x, sticker.y, sticker.width, sticker.height);
  }
}
