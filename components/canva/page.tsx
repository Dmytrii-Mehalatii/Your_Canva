"use client";

import { useCursor } from "@/lib/utils/useCursor";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Canva(props: {
  draw: boolean;
  brushSize: number;
  color: string;
  tool?: "pen" | "rubber";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const position = useCursor();
  const positionRef = useRef<{ x: number; y: number } | null>(null);

  const [canvasHeight, setCanvasHeight] = useState<number>(1000);
  const [canvasWidth, setCanvasWidth] = useState<number>(1000);

  const styles = props.draw ? "cursor-none" : "";

  const startDrawing = useCallback(
    (context: CanvasRenderingContext2D) => {
      context.lineWidth = props.brushSize;
      context.lineCap = "round";
      context.strokeStyle =
        props.tool === "pen" ? props.color : "rgba(0,0,0,1)";
      context.globalCompositeOperation =
        props.tool === "pen" ? "source-over" : "destination-out";
      context?.beginPath();
      context?.moveTo(positionRef.current?.x || 0, positionRef.current?.y || 0);
      context?.lineTo(position.x || 0, position.y || 0);
      context?.stroke();
    },
    [position.x, position.y, props.brushSize, props.color, props.tool]
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
    />
  );
}
