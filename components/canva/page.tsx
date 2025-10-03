"use client";

import { useColor } from "@/lib/utils/useColorContext";
import { useCursor } from "@/lib/utils/useCursor";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Canva(props: {
  draw: boolean;
  setDrawIn: (p: boolean) => void;
  brushSize: number;
  tool: "pen" | "rubber" | "other";
  setShowCustom: (p: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const position = useCursor();
  const positionRef = useRef<{ x: number; y: number } | null>(null);
  const color = useColor();
  const [canvasHeight, setCanvasHeight] = useState<number>(1000);
  const [canvasWidth, setCanvasWidth] = useState<number>(1000);

  const styles = props.draw ? "cursor-none" : "";

  const startDrawing = useCallback(
    (context: CanvasRenderingContext2D) => {
      props.setDrawIn(false);
      context.lineWidth = props.brushSize;
      context.lineCap = "round";
      context.strokeStyle =
        props.tool === "pen" ? color.color : "rgba(0,0,0,1)";
      context.globalCompositeOperation =
        props.tool === "pen" ? "source-over" : "destination-out";

      context?.beginPath();
      context?.moveTo(positionRef.current?.x || 0, positionRef.current?.y || 0);
      context?.lineTo(position.x || 0, position.y || 0);
      context?.stroke();
    },
    [
      position.x,
      position.y,
      props.brushSize,
      color,
      props.tool,
      props.setDrawIn,
    ]
  );

  useEffect(() => {
    setCanvasHeight(window.innerHeight);
    setCanvasWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (
      props.draw &&
      typeof position.x === "number" &&
      typeof position.y === "number"
    ) {
      if (positionRef.current && context) {
        startDrawing(context);
      }
      positionRef.current = { x: position.x, y: position.y };
    } else if (!position.isTracking) {
      positionRef.current = null;
    }
  }, [position, props.draw, startDrawing]);
  return (
    <canvas
      ref={canvasRef}
      height={canvasHeight}
      width={canvasWidth}
      className={styles}
      onMouseEnter={() => props.setShowCustom(true)}
      onMouseLeave={() => props.setShowCustom(false)}
    />
  );
}
