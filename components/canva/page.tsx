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
  tool: "pen" | "rubber";
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
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const styles = props.draw ? "cursor-none" : "";

  const startDrawing = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (!context) return;

      props.setDrawIn(false);
      props.setRabOut(false);
      context.lineWidth = props.brushSize;
      context.lineCap = "round";
      context.strokeStyle =
        props.tool === "pen" ? color.color : "rgba(0,0,0,1)";
      context.globalCompositeOperation =
        props.tool === "pen" ? "source-over" : "destination-out";

      context.beginPath();
      context.moveTo(positionRef.current?.x || 0, positionRef.current?.y || 0);
      context.lineTo(position.x || 0, position.y || 0);
      context.stroke();
    },
    [position.x, position.y, color, props]
  );

  const drawDot = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!context) return;

    context.beginPath();
    context.fillStyle = props.tool === "pen" ? color.color : "rgba(0,0,0,1)";
    context.globalCompositeOperation =
      props.tool === "pen" ? "source-over" : "destination-out";
    context.arc(
      position.basicX || 0,
      position.basicY || 0,
      props.brushSize / 2,
      0,
      2 * Math.PI
    );
    context.fill();
  }, [position, props.brushSize, color.color, props.tool]);

  useEffect(() => {
    setCanvasHeight(window.innerHeight);
    setCanvasWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for (const stroke of strokes) {
      context.lineWidth = stroke.width;
      context.lineCap = "round";
      context.strokeStyle =
        stroke.tool === "pen" ? stroke.color : "rgba(0,0,0,1)";
      context.globalCompositeOperation =
        stroke.tool === "pen" ? "source-over" : "destination-out";

      context.beginPath();
      stroke.points.forEach((p, i) => {
        if (i === 0) context.moveTo(p.x, p.y);
        else context.lineTo(p.x, p.y);
      });
      context.stroke();
    }

    context.globalCompositeOperation = "source-over";
  }, [strokes, canvasHeight, canvasWidth]);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (
      props.draw &&
      typeof position.x === "number" &&
      typeof position.y === "number"
    ) {
      if (positionRef.current && context && props.showCustom) {
        startDrawing(context);
      }
      positionRef.current = { x: position.x, y: position.y };
    } else if (!position.isTracking) {
      positionRef.current = null;
    }
  }, [position, props, startDrawing, canvasHeight, canvasWidth]);

  const getPos = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  useEffect(() => {
    if (strokes.length > 0) {
      localStorage.setItem("strokes", JSON.stringify(strokes));
    }
  }, [strokes]);

  return (
    <canvas
      ref={canvasRef}
      height={canvasHeight}
      width={canvasWidth}
      className={styles}
      onMouseEnter={() => props.setShowCustom(true)}
      onMouseLeave={() => props.setShowCustom(false)}
      onMouseDown={(e: any) => {
        clickTimeout.current = setTimeout(() => {
          drawDot();
        }, 100);

        const pos = getPos(e);
        if (!pos) return;
        setCurrentStroke([{ x: pos.x, y: pos.y }]);
      }}
      onMouseMove={(e: any) => {
        if (clickTimeout.current) {
          clearTimeout(clickTimeout.current);
          clickTimeout.current = null;
        }
        const pos = getPos(e);
        if (!pos) return;
        setCurrentStroke((prev) => [...prev, { x: pos.x, y: pos.y }]);
      }}
      onMouseUp={() => {
        if (currentStroke.length > 0) {
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
        }
      }}
    />
  );
}
