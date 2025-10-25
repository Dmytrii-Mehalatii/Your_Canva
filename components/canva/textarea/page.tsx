"use client";

import IconButton from "@/components/IconButton";
import { useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type TextStroke = {
  value?: string;
  points: Point[];
};

interface Props {
  textStrokes?: TextStroke[];
  setTextStrokes: React.Dispatch<React.SetStateAction<TextStroke[]>>;
  viewport?: { x: number; y: number; scale: number };
}

function AutoResizeTextAreas({ textStrokes, setTextStrokes, viewport }: Props) {
  const measurerRef = useRef<HTMLSpanElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const [textareaHight, setTextareaHight] = useState<number | null>(null);
  const [textareaWidth, setTextareaWidth] = useState<number | null>(null);

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
    measurer.textContent = input.value || input.placeholder || "";

    input.style.width = measurer.offsetWidth + 12 + "px";
    setTextareaWidth(measurer.offsetWidth + 12);

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

        let customLeft, customTop;

        //Added hardcoded values, cause Idk how I can this other way :/
        if (top >= 50 && textareaHight) {
          customTop = top - 70;
        } else if (textareaHight) {
          customTop = top + textareaHight + 20;
        }

        return (
          <div key={index}>
            {currentIndex === index && (
              <div
                style={{
                  position: "absolute",
                  left: `${left}px`,
                  top: `${customTop}px`,
                  zIndex: 9999,
                  minWidth: `${50 * scale}px`,
                  maxWidth: `${600 * scale}px`,
                  width: `${textareaWidth}px`,
                }}
              >
                <div className="flex flex-row items-center bg-white gap-2 h-[48px] min-w-[520px] rounded-2xl shadow-[0_2px_4px_0_rgba(255,192,196,1)] px-4  ">
                  <div className="flex h-full items-center justify-center w-20">
                    <div className="bg-black rounded-full h-7 w-7"></div>
                    <IconButton
                      icon="keyboard_arrow_down"
                      size={6}
                      scale={1}
                      color="#1C1B1F"
                    />
                  </div>
                  <div className="h-full w-[2px] bg-[#FFC0C4]" />
                  <div className="flex h-full items-center justify-center w-20">
                    <IconButton
                      icon="match_case"
                      color="#1C1B1F"
                    />
                    <IconButton
                      icon="keyboard_arrow_down"
                      size={6}
                      scale={1}
                      color="#1C1B1F"
                    />
                  </div>
                  <div className="h-full w-[2px] bg-[#FFC0C4]" />
                  <div className="flex h-full items-center justify-center w-[108px] gap-3">
                    <IconButton
                      icon="check_indeterminate_small"
                      size={6}
                      scale={1}
                      color="#1C1B1F"
                    />
                    <p>text</p>
                    <IconButton
                      icon="add"
                      size={6}
                      scale={1}
                      color="#1C1B1F"
                    />
                  </div>
                  <div className="h-full w-[2px] bg-[#FFC0C4]" />
                  <div className="flex h-full items-center justify-center">
                    <IconButton
                      icon="format_bold"
                      color="#1C1B1F"
                      scale={1.6}
                      thin={true}
                    />
                    <IconButton
                      icon="format_italic"
                      color="#1C1B1F"
                      scale={1.6}
                      thin={true}
                    />
                    <IconButton
                      icon="format_underlined"
                      color="#1C1B1F"
                      scale={1.6}
                      thin={true}
                    />
                    <IconButton
                      icon="strikethrough_s"
                      color="#1C1B1F"
                      scale={1.6}
                      thin={true}
                    />
                  </div>
                </div>
              </div>
            )}
            <textarea
              key={index}
              value={text.value || ""}
              placeholder="Add text"
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                fontSize: `${20 * scale}px`,
                height: "2em",
                overflow: "hidden",
                resize: "none",
                display: "flex",
                justifyContent: "center",
                padding: `${6 * scale}px ${4 * scale}px ${2 * scale}px ${4 * scale}px`,
                zIndex: 9999,
                outline: "none",
                minWidth: `${50 * scale}px`,
                maxWidth: `${600 * scale}px`,
                wordBreak: "break-word",
                transformOrigin: "top left",
              }}
              onChange={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const newValue = target.value;
                setTextStrokes((prev) =>
                  prev.map((t, i) =>
                    i === index ? { ...t, value: newValue } : t
                  )
                );
                updateSize(target);
              }}
              onFocus={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.outline = "2px solid red";
                target.style.borderColor = "red";
                updateSize(target);
                setCurrentIndex(index);
              }}
              onBlur={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.outline = "none";

                const value = target.value.trim();
                setTextStrokes((prev) =>
                  prev.map((t, i) => (i === index ? { ...t, value } : t))
                );

                updateSize(target);
                setCurrentIndex(null);
              }}
              ref={(el) => el && updateSize(el)}
            />
          </div>
        );
      })}
    </>
  );
}

export default AutoResizeTextAreas;
