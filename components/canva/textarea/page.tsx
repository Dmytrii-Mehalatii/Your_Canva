"use client";

import { useEffect, useRef, useState } from "react";
import TextSettings from "./textSettings/page";
import { useFont } from "@/lib/utils/useFontContext";

type Point = {
  x: number;
  y: number;
};

type TextStroke = {
  value?: string;
  color: string;
  font: string;
  fontSize: number;
  points: Point[];
};

interface Props {
  textStrokes: TextStroke[];
  setTextStrokes: React.Dispatch<React.SetStateAction<TextStroke[]>>;
  viewport?: { x: number; y: number; scale: number };
}

export default function TextArea({
  textStrokes,
  setTextStrokes,
  viewport,
}: Props) {
  const measurerRef = useRef<HTMLSpanElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const [textareaHight, setTextareaHight] = useState<number | null>(null);
  const [textareaWidth, setTextareaWidth] = useState<number | null>(null);

  const settingsRef = useRef<HTMLElement | null>(null);

  const { font, fontSize, setFontSize } = useFont();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        !settingsRef.current?.contains(e.target as Node) &&
        !document.activeElement?.matches("textarea")
      ) {
        setCurrentIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (currentIndex !== null) {
      setTextStrokes((prev) =>
        prev.map((t, i) => (i === currentIndex ? { ...t, font } : t))
      );
    }
  }, [font]);

  useEffect(() => {
    if (currentIndex !== null) {
      setTextStrokes((prev) =>
        prev.map((t, i) => (i === currentIndex ? { ...t, fontSize } : t))
      );
    }
  }, [fontSize]);

  useEffect(() => {
    const measurer = document.createElement("div");
    measurer.style.position = "absolute";
    measurer.style.visibility = "hidden";
    measurer.style.whiteSpace = "pre";
    measurer.style.fontFamily = "inherit";
    document.body.appendChild(measurer);
    measurerRef.current = measurer;

    return () => {
      document.body.removeChild(measurer);
    };
  }, []);

  function updateSize(input: HTMLTextAreaElement | null) {
    if (!input || !measurerRef.current) return;
    const measurer = measurerRef.current;

    measurer.style.fontSize = input.style.fontSize;
    measurer.style.fontFamily = input.style.fontFamily;
    measurer.textContent = input.value || input.placeholder || "";

    input.style.width = measurer.offsetWidth + 12 + "px";
    setTextareaWidth(measurer.offsetWidth + 12);

    updateHight(input);
  }

  function updateHight(input: HTMLTextAreaElement | null) {
    if (!input || !measurerRef.current) return;
    input.style.height = "2em";
    input.style.height =
      Math.min(
        input.scrollHeight,
        24 * parseFloat(getComputedStyle(input).lineHeight)
      ) + "px";
    setTextareaHight(
      Math.min(
        input.scrollHeight,
        24 * parseFloat(getComputedStyle(input).lineHeight)
      )
    );
  }

  return (
    <>
      {textStrokes?.map((text, index) => {
        const scale = viewport?.scale ?? 1;
        const left = text.points[0].x * scale + (viewport?.x ?? 0);
        const top = text.points[0].y * scale + (viewport?.y ?? 0);

        let customTop;
        if (top >= 50 && textareaHight) {
          customTop = top - 70;
        } else if (textareaHight) {
          customTop = top + textareaHight + 20;
        }

        return (
          <div key={index}>
            {currentIndex === index && (
              <div ref={settingsRef}>
                <TextSettings
                  left={left}
                  customTop={customTop}
                  scale={scale}
                  textareaWidth={textareaWidth}
                  textColor={text}
                  textSize={text.fontSize}
                  setTextSize={setFontSize}
                  setTextColor={(newColor) =>
                    setTextStrokes((prev) =>
                      prev.map((t, i) =>
                        i === index ? { ...t, color: newColor } : t
                      )
                    )
                  }
                />
              </div>
            )}
            <textarea
              value={text.value || ""}
              placeholder="Add text"
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                color: `${text.color}`,
                fontFamily: text.font,
                fontSize: `${text.fontSize * scale}px`,
                height: "2em",
                overflow: "hidden",
                resize: "none",
                display: "flex",
                justifyContent: "center",
                padding: `${6 * scale}px ${4 * scale}px ${2 * scale}px ${4 * scale}px`,
                zIndex: 100,
                outline: "none",
                minWidth: `${50 * scale}px`,
                maxWidth: `${800 * scale}px`,
                wordBreak: "break-word",
                transformOrigin: "top left",
              }}
              onChange={(e) => {
                const newValue = e.target.value;
                setTextStrokes((prev) =>
                  prev.map((t, i) =>
                    i === index ? { ...t, value: newValue } : t
                  )
                );
                updateSize(e.target);
              }}
              onFocus={(e) => {
                e.target.style.outline = "2px solid red";
                e.target.style.borderColor = "red";
                updateSize(e.target);
                setCurrentIndex(index);
                setFontSize(text.fontSize);
              }}
              onBlur={(e) => {
                e.target.style.outline = "none";
                const value = e.target.value.trim();
                setTextStrokes((prev) =>
                  prev.map((t, i) => (i === index ? { ...t, value } : t))
                );
                updateSize(e.target);
                setTimeout(() => {
                  if (
                    !settingsRef.current?.contains(
                      document.activeElement as Node
                    )
                  ) {
                    setCurrentIndex(null);
                  }
                }, 50);
              }}
              ref={(el) => el && updateHight(el)}
            />
          </div>
        );
      })}
    </>
  );
}
