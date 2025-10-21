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

export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  color: string;
  width: number;
  tool: "pen" | "rubber" | "other" | "text";
  points: Point[];
  text?: string;
  fontSize?: number;
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
  // const miniCanvasRef = useRef<HTMLCanvasElement>(canvasRef.current);
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

  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const panningCursorStyle =
    position.isTracking && props.tool == "other" ? "cursor-grab" : "";
  const textCursorStyle = props.tool === "text" ? "cursor-text" : "";
  const styles = props.draw
    ? `cursor-none ${panningCursorStyle} ${textCursorStyle}`
    : `${panningCursorStyle} ${textCursorStyle}`;

  // const mapUpdateTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // function drawAllStrokes(context: CanvasRenderingContext2D) {
  //   for (const stroke of strokes) {
  //     context.lineWidth = stroke.width;
  //     context.lineCap = "round";
  //     context.lineJoin = "round";
  //     if (stroke.tool !== "other") {
  //       context.strokeStyle =
  //         stroke.tool === "pen" ? stroke.color : "rgba(0,0,0,1)";
  //       context.globalCompositeOperation =
  //         stroke.tool === "pen" ? "source-over" : "destination-out";
  //     }

  //     context.beginPath();
  //     stroke.points.forEach((p, i) => {
  //       if (i === 0) context.moveTo(p.x, p.y);
  //       else context.lineTo(p.x, p.y);
  //     });
  //     context.stroke();
  //   }

  //   context.globalCompositeOperation = "source-over";
  // }

  // useEffect(() => {
  //   const offscreen = document.createElement("canvas");
  //   offscreen.width = canvasWidth;
  //   offscreen.height = canvasHeight;
  //   miniCanvasRef.current = offscreen;
  // }, [canvasWidth, canvasHeight]);

  // function updateMap() {
  //   const miniCanvas = miniCanvasRef.current;
  //   const context = miniCanvas?.getContext("2d");
  //   if (!context || !miniCanvas) return;

  //   context.setTransform(1, 0, 0, 1, 1050, 500);
  //   context.clearRect(0, 0, miniCanvas.width, miniCanvas?.height);

  //   const scale = Math.min(550 / canvasWidth, 550 / canvasHeight);
  //   context.scale(scale, scale);

  //   drawAllStrokes(context);

  //   if (mapUpdateTimeout.current) return;
  //   mapUpdateTimeout.current = setTimeout(() => {
  //     const canvas = miniCanvasRef.current;
  //     if (canvas) props.setMapSrc(canvas.toDataURL("image/png"));
  //     mapUpdateTimeout.current = null;
  //   }, 400);
  // }

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
    // updateMap();

    if (currentStroke.length > 0) {
      context.lineWidth = props.brushSize;
      context.lineCap = "round";
      context.lineJoin = "round";
      if (props.tool !== "other" && props.tool !== "text") {
        context.strokeStyle =
          props.tool === "pen" ? color.color : "rgba(0,0,0,1)";
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
      if (stroke.tool === "text" && stroke.text) {
        context.font = `${stroke.fontSize || 20}px Arial`;
        context.fillStyle = stroke.color;
        const p = stroke.points[0];
        context.fillText(stroke.text, p.x, p.y);
        continue;
      }

      // normal stroke drawing
      context.lineWidth = stroke.width;
      context.lineCap = "round";
      context.lineJoin = "round";
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
  }, [strokes]);

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
      onMouseDown={(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        // clickTimeout.current = setTimeout(() => {
        //   drawDot();
        // }, 100);
        if (props.tool === "text") {
          const pos = getPos(e);
          if (!pos) return;

          const input = document.createElement("textarea");
          input.placeholder = "Add text";
          input.style.position = "absolute";
          input.style.left = `${e.clientX}px`;
          input.style.top = `${e.clientY}px`;
          input.style.fontSize = "20px";
          input.style.height = "2em";
          input.style.overflow = "hidden";
          input.style.resize = "none";
          input.style.display = "flex";
          input.style.justifyContent = "center";
          input.style.padding = "6px 4px 2px 4px";
          input.style.zIndex = "9999";
          input.style.outline = "none";
          input.style.minWidth = "50px";
          input.style.maxWidth = "600px";
          input.style.wordBreak = "break-word";

          document.body.appendChild(input);

          const measurer = document.createElement("span");
          measurer.style.position = "absolute";
          measurer.style.visibility = "hidden";
          measurer.style.whiteSpace = "pre";
          measurer.style.fontSize = input.style.fontSize;
          measurer.style.fontFamily = "inherit";
          document.body.appendChild(measurer);

          function updateWidth() {
            measurer.textContent = input.value || input.placeholder;
            input.style.width = measurer.offsetWidth + 10 + "px";

            input.style.height = "2em";
            input.style.height =
              Math.min(
                input.scrollHeight,
                24 * parseFloat(getComputedStyle(input).lineHeight)
              ) + "px";
          }

          input.addEventListener("input", updateWidth);
          updateWidth();

          input.addEventListener("focus", () => {
            input.style.outline = "2px solid red";
            input.style.borderColor = "red";
          });

          input.addEventListener("blur", () => {
            input.style.outline = "none";
            input.style.borderColor = "#888";
          });

          const value = input.value;

          if (value.trim() !== "") {
            setStrokes((prev) => [
              ...prev,
              {
                color: color.color,
                width: props.brushSize,
                tool: "text",
                points: [{ x: pos.x, y: pos.y }],
                text: value,
                fontSize: 20,
              },
            ]);
            document.body.removeChild(input);

            render();
          }

          return;
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
