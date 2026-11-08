import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { createPainter, type CanvasSize, type Painter } from "@/lib/board/draw";
import { rectFromPoints, screenToBoard, zoomViewport } from "@/lib/board/geometry";
import { appendPoint, makeShape, makeSticker, makeStroke, makeText, placeSticker } from "@/lib/board/items";
import { MIN_SHAPE_SIZE, TOOLS } from "@/lib/constants";
import type { Board } from "@/lib/hooks/useBoard";
import { useImages } from "@/lib/hooks/useImages";
import type { Point, Sticker, Stroke, Tool, ToolSettings, Viewport } from "@/lib/types";
import BrushCursor from "./BrushCursor";
import ShapeLayer from "./ShapeLayer";
import StickerSettings from "./StickerSettings";
import TextLayer from "./TextLayer";

type Props = {
  tool: Tool;
  settings: ToolSettings;
  board: Board;
  /** Called when a press starts on the canvas, before the active tool handles it. */
  onPointerDown: () => void;
};

type CanvasEvent = PointerEvent<HTMLCanvasElement> | WheelEvent<HTMLCanvasElement>;

/** The press currently in progress, from pointerdown until pointerup/cancel. */
type Gesture =
  | { kind: "pan"; anchor: Point; origin: Point }
  | { kind: "stroke"; stroke: Stroke }
  | { kind: "shape"; start: Point; end: Point }
  | { kind: "sticker"; sticker: Sticker };

const CURSOR: Record<Tool, string> = {
  select: "active:cursor-grabbing",
  pen: "cursor-none",
  eraser: "cursor-none",
  text: "cursor-text",
  shape: "cursor-crosshair",
  sticker: "cursor-default",
};

export default function Canvas({ tool, settings, board, onPointerDown }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painter = useRef<Painter | null>(null);

  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0, dpr: 1 });
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  // The ref is the source of truth so pointer events, which can arrive faster than renders,
  // never act on a stale gesture; the state mirror drives rendering.
  const gestureRef = useRef<Gesture | null>(null);
  const [gesture, setGestureState] = useState<Gesture | null>(null);
  const setGesture = (next: Gesture | null) => {
    gestureRef.current = next;
    setGestureState(next);
  };
  /** Pointer position over the canvas in canvas pixels, tracked only for tools with a hover preview. */
  const [pointer, setPointer] = useState<Point | null>(null);

  const { hoverPreview } = TOOLS[tool];
  const currentStroke = gesture?.kind === "stroke" ? gesture.stroke : null;
  const shapeDraft =
    gesture?.kind === "shape" ? { ...rectFromPoints(gesture.start, gesture.end), ...settings.shape } : null;

  const stickerSrcs = useMemo(() => {
    const srcs = board.stickers.items.map((sticker) => sticker.src);
    if (settings.sticker) srcs.push(settings.sticker.src);
    return srcs;
  }, [board.stickers.items, settings.sticker]);
  const images = useImages(stickerSrcs);

  const stickerPreview = useMemo(
    () =>
      hoverPreview === "sticker" && settings.sticker && pointer
        ? placeSticker(screenToBoard(pointer, viewport), settings.sticker)
        : null,
    [hoverPreview, settings.sticker, pointer, viewport],
  );

  useLayoutEffect(() => {
    const measure = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio || 1 });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Layout effect so the repaint lands in the same frame as the state change (no flash after a resize).
  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    painter.current ??= createPainter();
    painter.current.paint(canvasRef.current, size, viewport, board.strokes.items, {
      currentStroke,
      stickers: board.stickers.items,
      stickerPreview,
      images,
    });
  }, [board.strokes.items, board.stickers.items, currentStroke, stickerPreview, images, viewport, size]);

  const localPoint = (e: CanvasEvent): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    // Only the first finger / main button draws; extra touches must not restart the gesture.
    if (!e.isPrimary || e.button !== 0) return;
    // Keep the browser from moving focus or starting a text selection; text boxes follow the selection state instead.
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    onPointerDown();

    const local = localPoint(e);
    const point = screenToBoard(local, viewport);
    board.select(tool === "select" ? board.itemAt(point) : null);

    switch (tool) {
      case "select":
        setGesture({ kind: "pan", anchor: local, origin: viewport });
        break;
      case "pen":
      case "eraser":
        setGesture({ kind: "stroke", stroke: makeStroke(tool, settings.penColor, settings.brushSize, point) });
        break;
      case "shape":
        setGesture({ kind: "shape", start: point, end: point });
        break;
      case "sticker":
        if (settings.sticker) setGesture({ kind: "sticker", sticker: settings.sticker });
        break;
      case "text": {
        const text = makeText(point, settings.text);
        board.texts.add(text);
        board.select({ kind: "text", id: text.id });
        break;
      }
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const current = gestureRef.current;
    if (!e.isPrimary || (!current && !hoverPreview)) return;
    const local = localPoint(e);
    if (hoverPreview) setPointer(local);
    if (!current) return;

    const point = screenToBoard(local, viewport);
    switch (current.kind) {
      case "pan": {
        const { anchor, origin } = current;
        setViewport((v) => ({ ...v, x: origin.x + local.x - anchor.x, y: origin.y + local.y - anchor.y }));
        break;
      }
      case "stroke":
        setGesture({ ...current, stroke: appendPoint(current.stroke, point) });
        break;
      case "shape":
        setGesture({ ...current, end: point });
        break;
    }
  };

  const finishGesture = (e: PointerEvent<HTMLCanvasElement>, commit: boolean) => {
    const current = gestureRef.current;
    if (!e.isPrimary || !current) return;
    setGesture(null);
    if (!commit) return;

    const point = screenToBoard(localPoint(e), viewport);
    switch (current.kind) {
      case "stroke":
        board.strokes.add(appendPoint(current.stroke, point));
        break;
      case "shape": {
        const rect = rectFromPoints(current.start, point);
        if (rect.width >= MIN_SHAPE_SIZE && rect.height >= MIN_SHAPE_SIZE) board.shapes.add(makeShape(rect, settings.shape));
        break;
      }
      case "sticker":
        board.stickers.add(makeSticker(point, current.sticker));
        break;
    }
  };

  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    const focus = localPoint(e);
    setViewport((v) => zoomViewport(v, focus, e.deltaY));
  };

  const { selected } = board;

  return (
    <div className="relative">
      <ShapeLayer shapes={board.shapes.items} viewport={viewport} draft={shapeDraft} />
      <canvas
        ref={canvasRef}
        style={{ width: size.width, height: size.height }}
        className={`relative z-10 block touch-none ${CURSOR[tool]}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => finishGesture(e, true)}
        onPointerCancel={(e) => finishGesture(e, false)}
        onPointerLeave={() => setPointer(null)}
        onWheel={handleWheel}
      />
      <TextLayer
        texts={board.texts.items}
        viewport={viewport}
        selectedId={selected?.kind === "text" ? selected.item.id : null}
        onSelect={(id) => board.select({ kind: "text", id })}
        onChange={board.texts.update}
      />
      {selected?.kind === "sticker" && (
        <StickerSettings sticker={selected.item} viewport={viewport} onDelete={board.deleteSelected} />
      )}
      {hoverPreview === "brush" && pointer && (
        <BrushCursor position={pointer} size={settings.brushSize * viewport.scale} />
      )}
    </div>
  );
}
