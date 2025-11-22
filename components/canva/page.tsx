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
import { useShape } from "@/lib/utils/useShapeContext";
import StickerSettings from "./stickerSettings/page";
import {
  Point,
  ShapeBorder,
  ShapeStroke,
  StickerStroke,
  Stroke,
  TextStroke,
} from "@/lib/types/CanvasTypes";
const TextArea = dynamic(() => import("./textarea/page"), {
  ssr: false,
});

const AllShapes = dynamic(() => import("./shapes/page"), {
  ssr: false,
});

export default function Canva(props: {
  draw: boolean;
  setDrawIn: (p: boolean) => void;
  setRabOut: (p: boolean) => void;
  setShapesBar: (p: boolean) => void;
  brushSize: number;
  tool: "pen" | "rubber" | "text" | "sticker" | "shape" | "other";
  showCustom: boolean;
  setShowCustom: (p: boolean) => void;
  clearAll: boolean;
  setClearAll: (p: boolean) => void;
  stickerBar: boolean;
  choosenSticker: string;
  stickerSize: number[];
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
  const { font, fontSize } = useFont();
  const { type } = useShape();

  let radius = "";
  let rotate = "";
  if (type == "circle") {
    radius = "100%";
  } else if (type == "rhombus") {
    rotate = "45deg";
  }

  const [canvasHeight, setCanvasHeight] = useState<number>(1000);
  const [canvasWidth, setCanvasWidth] = useState<number>(1000);

  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [currentStickerStroke, setCurrentstickerStroke] = useState<Point[]>([]);

  const [drawShapesBorder, setDrawShapesBorder] = useState(false);
  const [shapeBorders, setShapeBorders] = useState<ShapeBorder[]>([]);
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

  const [shapeStrokes, setShapeStrokes] = useState<ShapeStroke[]>([]);

  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(
    null
  );

  const [stickerStrokes, setStickerStrokes] = useState<StickerStroke[]>(() => {
    if (typeof window !== "undefined") {
      const savedSticked = localStorage.getItem("stickerStrokes");
      if (savedSticked) return JSON.parse(savedSticked);
    }
    return [];
  });

  const [selectedStickerIndex, setSelectedStickerIndex] = useState<
    number | null
  >(null);
  console.log(selectedStickerIndex);

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

  const render = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const pos = getPos(e);
    if (!pos) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || !canvas) return;
    const { x, y, scale } = viewportTransformRef.current;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    context.setTransform(scale, 0, 0, scale, x, y);
    reRender();

    if (props.tool == "sticker") {
      const img = new Image();
      context.globalAlpha = 0.5;
      img.src = `${props.choosenSticker}`;
      context.drawImage(
        img,
        pos.x - 60,
        pos.y - 20,
        props.stickerSize[0],
        props.stickerSize[1]
      );
      context.globalAlpha = 1.0;
    }

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

  let shapeLeft = 0;
  let shapeTop = 0;
  let shapeWidth = 0;
  let shapeHeight = 0;
  if (drawShapesBorder && shapeBorders.length > 0 && canvasRef.current) {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const sp = shapeBorders[0].startPoint[0];
    const ep = shapeBorders[0].endPoint[0];
    const minX = Math.min(sp.x, ep.x);
    const minY = Math.min(sp.y, ep.y);
    shapeLeft =
      canvasRect.left +
      minX * viewportTransformRef.current.scale +
      viewportTransformRef.current.x;
    shapeTop =
      canvasRect.top +
      minY * viewportTransformRef.current.scale +
      viewportTransformRef.current.y;
    shapeWidth = Math.abs(ep.x - sp.x) * viewportTransformRef.current.scale;
    shapeHeight = Math.abs(ep.y - sp.y) * viewportTransformRef.current.scale;
  }

  const hitTestShapes = (clientX: number, clientY: number) => {
    for (let i = shapeStrokes.length - 1; i >= 0; i--) {
      const s = shapeStrokes[i];
      const left =
        s.left * viewportTransformRef.current.scale +
        (viewportTransformRef.current.x ?? 0);
      const top =
        s.top * viewportTransformRef.current.scale +
        (viewportTransformRef.current.y ?? 0);
      const w = s.width ?? 0;
      const h = s.height ?? 0;

      if (
        clientX >= left &&
        clientX <= left + w &&
        clientY >= top &&
        clientY <= top + h
      ) {
        return i;
      }
    }
    return -1;
  };

  const hitTestStickers = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return -1;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = viewportTransformRef.current.scale;
    const tx = viewportTransformRef.current.x;
    const ty = viewportTransformRef.current.y;

    for (let i = stickerStrokes.length - 1; i >= 0; i--) {
      const s = stickerStrokes[i];

      const left = rect.left + (s.left * scale + tx);
      const top = rect.top + (s.top * scale + ty);

      const w = s.width * scale;
      const h = s.height * scale;

      if (
        clientX >= left &&
        clientX <= left + w &&
        clientY >= top &&
        clientY <= top + h
      ) {
        return i;
      }
    }

    return -1;
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

    for (const stickerStroke of stickerStrokes) {
      const img = new Image();
      img.src = `${stickerStroke.src}`;

      stickerStroke.points.forEach((p) => {
        context.drawImage(
          img,
          p.x,
          p.y,
          stickerStroke.width,
          stickerStroke.height
        );
      });
    }
  }, [strokes, stickerStrokes]);

  useLayoutEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  //Had to get my shapes using useEffect cause I had srr error :(
  useEffect(() => {
    const saved = localStorage.getItem("shapeStrokes");
    if (saved && saved.length > 0) {
      setShapeStrokes(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (strokes.length > 0) {
      localStorage.setItem("strokes", JSON.stringify(strokes));
    }
    if (textStrokes.length > 0) {
      localStorage.setItem("textStrokes", JSON.stringify(textStrokes));
    } else {
      localStorage.removeItem("textStrokes");
    }

    if (shapeStrokes.length > 0) {
      localStorage.setItem("shapeStrokes", JSON.stringify(shapeStrokes));
    } else {
      localStorage.removeItem("shapeStrokes");
    }

    if (stickerStrokes.length > 0) {
      localStorage.setItem("stickerStrokes", JSON.stringify(stickerStrokes));
    }
  }, [strokes, textStrokes, shapeStrokes, stickerStrokes]);

  const getNewViewportPosition = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const dx = e.clientX - previousViewPosition.current.x;
    const dy = e.clientY - previousViewPosition.current.y;

    previousViewPosition.current = { x: e.clientX, y: e.clientY };

    viewportTransformRef.current.x += dx;
    viewportTransformRef.current.y += dy;

    render(e);
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
      {textStrokes && (
        <TextArea
          textStrokes={textStrokes}
          setTextStrokes={setTextStrokes}
          viewport={viewportTransformRef.current}
        />
      )}

      {shapeStrokes.length > 0 && (
        <AllShapes
          shapeStrokes={shapeStrokes}
          setShapeStrokes={setShapeStrokes}
          viewport={viewportTransformRef.current}
          shapeIndex={selectedShapeIndex}
        />
      )}

      {selectedStickerIndex !== null && (
        <StickerSettings
          selectedStickerIndex={selectedStickerIndex}
          setSelectedStickerIndex={setSelectedStickerIndex}
          stickerStrokes={stickerStrokes}
          setStickerStrokes={setStickerStrokes}
          viewport={viewportTransformRef.current}
        />
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          height={canvasHeight}
          width={canvasWidth}
          className={styles}
          onMouseEnter={() => props.setShowCustom(true)}
          onMouseLeave={() => props.setShowCustom(false)}
          onWheel={(e) => {
            updateScale(e);
            render(e);
          }}
          onMouseDown={(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
            const pos = getPos(e);
            if (!pos) return;

            const clickedIndex = hitTestShapes(e.clientX, e.clientY);
            if (clickedIndex !== -1) {
              setSelectedShapeIndex(clickedIndex);
            } else {
              setSelectedShapeIndex(null);
            }

            const clickedStickerIndex = hitTestStickers(e.clientX, e.clientY);
            if (clickedStickerIndex !== -1) {
              setSelectedStickerIndex(clickedStickerIndex);
              console.log(selectedStickerIndex);
            } else {
              setSelectedStickerIndex(null);
            }

            if (props.tool === "text") {
              createInput(e);
            }

            if (props.tool === "shape") {
              setDrawShapesBorder(true);

              setShapeBorders([
                {
                  startPoint: [{ x: pos.x, y: pos.y }],
                  endPoint: [{ x: pos.x, y: pos.y }],
                },
              ]);
            }

            if (props.tool == "other") {
              isDraggingRef.current = true;
              previousViewPosition.current = { x: e.clientX, y: e.clientY };
            }

            props.setDrawIn(false);
            props.setRabOut(false);
            props.setShapesBar(false);

            if (position.isTracking) {
              setCurrentStroke([{ x: pos.x, y: pos.y }]);
            }

            if (props.tool == "sticker") {
              setCurrentstickerStroke(() => [{ x: pos.x - 60, y: pos.y - 20 }]);
            }
          }}
          onMouseMove={(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
            if (props.tool === "other" && isDraggingRef.current) {
              getNewViewportPosition(e);
            }

            const pos = getPos(e);
            if (!pos) return;
            if (
              position.isTracking &&
              (props.tool == "pen" || props.tool == "rubber")
            ) {
              setCurrentStroke((prev) => [...prev, { x: pos.x, y: pos.y }]);
            }

            if (props.tool === "shape" && drawShapesBorder) {
              setShapeBorders((prev) => {
                const last = prev[prev.length - 1];

                const updatedLast = {
                  ...last,
                  endPoint: [{ x: pos.x, y: pos.y }],
                };
                return [updatedLast];
              });
            }
            render(e);
          }}
          onMouseUp={(e) => {
            const pos = getPos(e);
            if (!pos) return;

            if (
              currentStroke.length > 0 &&
              (props.tool == "pen" || props.tool == "rubber")
            ) {
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

            if (props.tool === "shape" && shapeBorders[0].startPoint) {
              setDrawShapesBorder(false);
              setShapeStrokes((prev) => [
                ...prev,
                {
                  type: type,
                  color: color.shapeColor,
                  width: Math.abs(
                    shapeBorders[0].startPoint[0].x -
                      shapeBorders[0].endPoint[0].x
                  ),
                  height: Math.abs(
                    shapeBorders[0].startPoint[0].y -
                      shapeBorders[0].endPoint[0].y
                  ),
                  left: Math.min(
                    shapeBorders[0].startPoint[0].x,
                    shapeBorders[0].endPoint[0].x
                  ),
                  top: Math.min(
                    shapeBorders[0].startPoint[0].y,
                    shapeBorders[0].endPoint[0].y
                  ),
                  borderWidth: 0,
                  borderStyle: "solid",
                  points: [
                    {
                      startPoint: shapeBorders[0].startPoint,
                      endPoint: shapeBorders[0].endPoint,
                    },
                  ],
                },
              ]);
            }

            if (props.tool == "sticker") {
              setStickerStrokes((prev) => [
                ...prev,
                {
                  src: props.choosenSticker,
                  width: props.stickerSize[0],
                  height: props.stickerSize[1],
                  points: currentStickerStroke.map((p) => ({ ...p })),
                  top: pos.y - 20,
                  left: pos.x - 60,
                },
              ]);
            }
          }}
        />
      </div>
      {drawShapesBorder && shapeBorders.length > 0 && (
        <div
          className="absolute border-2 pointer-events-none"
          style={{
            left: `${shapeLeft}px`,
            top: `${shapeTop}px`,
            width: `${shapeWidth}px`,
            height: `${shapeHeight}px`,
            borderColor: `${color.shapeColor}`,
            borderRadius: `${radius}`,
            rotate: rotate,
          }}
        ></div>
      )}
    </div>
  );
}
