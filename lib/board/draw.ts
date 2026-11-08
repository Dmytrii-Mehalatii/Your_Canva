import type { PlacedSticker, Stroke, Viewport } from "../types";

type Images = ReadonlyMap<string, HTMLImageElement>;
/** CSS size of the canvas plus the device pixel ratio that maps it to the backing store. */
export type CanvasSize = { width: number; height: number; dpr: number };

/** Everything drawn on top of the committed ink. */
export type Overlay = {
  currentStroke: Stroke | null;
  stickers: PlacedSticker[];
  stickerPreview: PlacedSticker | null;
  images: Images;
};

/**
 * Paints the board onto a canvas. Committed ink is rasterized into an offscreen layer that is
 * reused while only the overlay changes, and extended in place when one stroke is appended, so a
 * stroke in progress costs one image copy rather than re-stroking every path on the board.
 */
export function createPainter() {
  const ink = document.createElement("canvas");
  let inkState: { strokes: Stroke[]; viewport: Viewport; size: CanvasSize } | null = null;

  const rasterizeInk = (strokes: Stroke[], viewport: Viewport, size: CanvasSize) => {
    const previous = inkState;
    inkState = { strokes, viewport, size };
    if (previous?.viewport === viewport && previous.size === size && isAppend(previous.strokes, strokes)) {
      // The ink context still carries the transform from its last full raster.
      const ctx = ink.getContext("2d");
      if (ctx) drawStroke(ctx, strokes[strokes.length - 1]);
      return;
    }
    const ctx = prepare(ink, size, viewport);
    if (!ctx) return;
    for (const stroke of strokes) drawStroke(ctx, stroke);
  };

  return {
    paint(canvas: HTMLCanvasElement, size: CanvasSize, viewport: Viewport, strokes: Stroke[], overlay: Overlay) {
      if (inkState?.strokes !== strokes || inkState.viewport !== viewport || inkState.size !== size) {
        rasterizeInk(strokes, viewport, size);
      }
      const ctx = prepare(canvas, size, viewport);
      if (!ctx) return;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(ink, 0, 0);
      ctx.restore();

      if (overlay.currentStroke) drawStroke(ctx, overlay.currentStroke);

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

function isAppend(previous: Stroke[], next: Stroke[]) {
  return next.length === previous.length + 1 && previous.every((stroke, i) => next[i] === stroke);
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

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const [first, ...rest] = stroke.points;
  if (!first) return;

  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
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

function drawSticker(ctx: CanvasRenderingContext2D, sticker: PlacedSticker, images: Images) {
  const image = images.get(sticker.src);
  if (image?.complete && image.naturalWidth > 0) {
    ctx.drawImage(image, sticker.x, sticker.y, sticker.width, sticker.height);
  }
}
