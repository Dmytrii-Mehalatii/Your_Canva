"use client";

import { useColor } from "@/lib/utils/useColorContext";
import { useCursor } from "@/lib/utils/useCursor";
import { useCallback, useEffect, useRef, useState } from "react";

export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  color: string;
  width: number;
  tool: "pen" | "rubber" | "other";
  points: Point[];
};

export default function Canva(props: {
  draw: boolean;
  setDrawIn: (p: boolean) => void;
  setRabOut: (p: boolean) => void;
  brushSize: number;
  tool: "pen" | "rubber" | "other";
  showCustom: boolean;
  setShowCustom: (p: boolean) => void;
  clearAll: boolean;
  setClearAll: (p: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionRef = useRef<{ x: number; y: number } | null>(null);
  // const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const previousViewPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewportTransformRef = useRef<{ x: number; y: number; scale: number }>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const isDraggingRef = useRef(false);

  const position = useCursor();
  const color = useColor();
  const [canvasHeight, setCanvasHeight] = useState<number>(1000);
  const [canvasWidth, setCanvasWidth] = useState<number>(1000);

  const [strokes, setStrokes] = useState<Stroke[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("strokes");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  console.log(viewportTransformRef.current.scale);

  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const panningCursorStyle =
    position.isTracking && props.tool == "other" ? "cursor-grab" : "";
  const styles = props.draw
    ? `cursor-none ${panningCursorStyle}`
    : `${panningCursorStyle}`;

  // const drawDot = useCallback(() => {
  //   const canvas = canvasRef.current;
  //   const context = canvas?.getContext("2d");

  //   if (!context) return;

  //   context.beginPath();
  //   context.fillStyle = props.tool === "pen" ? color.color : "rgba(0,0,0,1)";
  //   context.globalCompositeOperation =
  //     props.tool === "pen" ? "source-over" : "destination-out";
  //   context.arc(
  //     position.basicX || 0,
  //     position.basicY || 0,
  //     props.brushSize / 2,
  //     0,
  //     2 * Math.PI
  //   );
  //   context.fill();
  // }, [position, props.brushSize, color.color, props.tool]);

  const updateScale = (e) => {
    const previousScale = viewportTransformRef.current.scale;
    const oldX = viewportTransformRef.current.x;
    const oldY = viewportTransformRef.current.y;

    const localX = e.clientX;
    const localY = e.clientY;

    const sensitivity = 0.003;

    let newScale = previousScale - e.deltaY * sensitivity;

    newScale = Math.min(Math.max(newScale, 0.2), 5);

    const newX = localX - (localX - oldX) * (newScale / previousScale);
    const newY = localY - (localY - oldY) * (newScale / previousScale);

    viewportTransformRef.current.x = newX;
    viewportTransformRef.current.y = newY;
    viewportTransformRef.current.scale = newScale;
    color.setScale(viewportTransformRef.current.scale);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const { x, y, scale } = viewportTransformRef.current;

    return {
      x: (e.clientX - rect.left - x) / scale,
      y: (e.clientY - rect.top - y) / scale,
    };
  };

  const render = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || !canvas) return;
    const { x, y, scale } = viewportTransformRef.current;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    context.setTransform(scale, 0, 0, scale, x, y);
    reRender();

    if (currentStroke.length > 0) {
      context.lineWidth = props.brushSize;
      context.lineCap = "round";
      context.lineJoin = "round";
      if (props.tool !== "other") {
        context.strokeStyle =
          props.tool === "pen" ? color.color : "rgba(0,0,0,1)";
        context.globalCompositeOperation =
          props.tool === "pen" ? "source-over" : "destination-out";
      }

      if (props.tool !== "other") {
        context.beginPath();
        currentStroke.forEach((p, i) => {
          if (i === 0) context.moveTo(p.x, p.y);
          else context.lineTo(p.x, p.y);
        });
        context.stroke();
      }
    }
  };

  const reRender = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;

    for (const stroke of strokes) {
      context.lineWidth = stroke.width;
      context.lineCap = "round";
      context.lineJoin = "round";
      if (stroke.tool !== "other") {
        context.strokeStyle =
          stroke.tool === "pen" ? stroke.color : "rgba(0,0,0,1)";
        context.globalCompositeOperation =
          stroke.tool === "pen" ? "source-over" : "destination-out";
      }

      context.beginPath();
      stroke.points.forEach((p, i) => {
        if (i === 0) context.moveTo(p.x, p.y);
        else context.lineTo(p.x, p.y);
      });
      context.stroke();
    }

    context.globalCompositeOperation = "source-over";
  }, [strokes]);

  //can chagne it with use memo
  useEffect(() => {
    setCanvasHeight(window.innerHeight);
    setCanvasWidth(window.innerWidth);
  }, []);

  //For redrawing the canvas when strokes change
  useEffect(() => {
    reRender();
  }, [reRender]);

  //For clearing the canvas
  useEffect(() => {
    if (props.clearAll) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!context) return;

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      setStrokes([]);
      localStorage.removeItem("strokes");
      props.setClearAll(false);
    }
  }, [props, canvasHeight, canvasWidth]);

  // can use useMemo
  useEffect(() => {
    if (strokes.length > 0) {
      localStorage.setItem("strokes", JSON.stringify(strokes));
    }
  }, [strokes]);

  const getNewViewportPosition = (e: MouseEvent) => {
    const dx = e.clientX - previousViewPosition.current.x;
    const dy = e.clientY - previousViewPosition.current.y;

    previousViewPosition.current = { x: e.clientX, y: e.clientY };

    viewportTransformRef.current.x += dx;
    viewportTransformRef.current.y += dy;

    render();
  };

  return (
    <canvas
      ref={canvasRef}
      height={canvasHeight}
      width={canvasWidth}
      className={styles}
      onMouseEnter={() => props.setShowCustom(true)}
      onMouseLeave={() => props.setShowCustom(false)}
      onWheel={(e) => {
        updateScale(e);

        render();
      }}
      onMouseDown={(e: any) => {
        // clickTimeout.current = setTimeout(() => {
        //   drawDot();
        // }, 100);

        if (props.tool == "other") {
          isDraggingRef.current = true;
          previousViewPosition.current = { x: e.clientX, y: e.clientY };
        }

        const pos = getPos(e);
        if (!pos) return;
        if (position.isTracking) {
          setCurrentStroke([{ x: pos.x, y: pos.y }]);
        }
      }}
      onMouseMove={(e: any) => {
        // if (clickTimeout.current) {
        //   clearTimeout(clickTimeout.current);
        //   clickTimeout.current = null;
        // }

        if (props.tool === "other" && isDraggingRef.current) {
          getNewViewportPosition(e);
        }

        const pos = getPos(e);
        if (!pos) return;
        if (position.isTracking) {
          setCurrentStroke((prev) => [...prev, { x: pos.x, y: pos.y }]);
        }
        render();
      }}
      onMouseUp={() => {
        if (currentStroke.length > 0 && props.tool !== "other") {
          setStrokes((prev) => [
            ...prev,
            {
              color: color.color,
              width: props.brushSize,
              tool: props.tool === "pen" ? "pen" : "rubber",
              points: currentStroke.map((p) => ({ ...p })),
            },
          ]);
          setCurrentStroke([]);
          positionRef.current = null;
        } else {
          setCurrentStroke([]);
          isDraggingRef.current = false;
        }
      }}
    />
  );
}
