"use client";

import { useColor } from "@/lib/utils/useColorContext";
import { useCursor } from "@/lib/utils/useCursor";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useFont } from "@/lib/utils/useFontContext";
const TextArea = dynamic(() => import("./textarea/page"), {
  ssr: false,
});
export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  penColor: string;
  width: number;
  tool: "pen" | "rubber" | "other" | "text";
  points: Point[];
};

export type TextStroke = {
  color: string;
  font: string;
  fontSize: number;
  value: string;
  points: Point[];
};

export default function Canva(props: {
  draw: boolean;
  setDrawIn: (p: boolean) => void;
  setRabOut: (p: boolean) => void;
  brushSize: number;
  tool: "pen" | "rubber" | "text" | "other";
  showCustom: boolean;
  setShowCustom: (p: boolean) => void;
  clearAll: boolean;
  setClearAll: (p: boolean) => void;
  setMapSrc: (src: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionRef = useRef<{ x: number; y: number } | null>(null);

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

  const [textStrokes, setTextStrokes] = useState<TextStroke[]>(() => {
    if (typeof window !== "undefined") {
      const savedText = localStorage.getItem("textStrokes");
      if (savedText) return JSON.parse(savedText);
    }
    return [];
  });

  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const { font, fontSize } = useFont();

  const panningCursorStyle =
    position.isTracking && props.tool == "other" ? "cursor-grab" : "";
  const textCursorStyle = props.tool === "text" ? "cursor-text" : "";
  const styles = props.draw
    ? `cursor-none ${panningCursorStyle} ${textCursorStyle}`
    : `${panningCursorStyle} ${textCursorStyle}`;

  const updateScale = (e: React.WheelEvent<HTMLCanvasElement>) => {
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
      if (props.tool !== "other" && props.tool !== "text") {
        context.strokeStyle =
          props.tool === "pen" ? color.penColor : "rgba(0,0,0,1)";
        context.globalCompositeOperation =
          props.tool === "pen" ? "source-over" : "destination-out";
      }

      if (props.tool !== "other" && props.tool !== "text") {
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
      context.strokeStyle =
        stroke.tool === "pen" ? stroke.penColor : "rgba(0,0,0,1)";
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
  }, [strokes]);

  useLayoutEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //For clearing the canvas
  useEffect(() => {
    if (!props.clearAll) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    setStrokes([]);
    localStorage.removeItem("strokes");
    props.setClearAll(false);
  }, [props.clearAll, canvasHeight, canvasWidth]);

  useEffect(() => {
    if (strokes.length > 0) {
      localStorage.setItem("strokes", JSON.stringify(strokes));
    }
    if (textStrokes.length > 0) {
      localStorage.setItem("textStrokes", JSON.stringify(textStrokes));
    }
  }, [strokes, textStrokes]);

  const getNewViewportPosition = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const dx = e.clientX - previousViewPosition.current.x;
    const dy = e.clientY - previousViewPosition.current.y;

    previousViewPosition.current = { x: e.clientX, y: e.clientY };

    viewportTransformRef.current.x += dx;
    viewportTransformRef.current.y += dy;

    render();
  };

  const createInput = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const pos = getPos(e);
      if (!pos) return;

      setTextStrokes((prev) => [
        ...prev,
        {
          value: "",
          color: String(color.textColor),
          font: font ?? "",
          fontSize: fontSize,
          points: [{ x: pos.x, y: pos.y }],
        },
      ]);
    },
    [color.textColor, font, fontSize]
  );

  return (
    <div>
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
        onMouseDown={(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
          if (props.tool === "text") {
            createInput(e);
          }

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
        onMouseMove={(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
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
                penColor: color.penColor,
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
      {textStrokes && (
        <TextArea
          textStrokes={textStrokes}
          setTextStrokes={setTextStrokes}
          viewport={viewportTransformRef.current}
        />
      )}
    </div>
  );
}
