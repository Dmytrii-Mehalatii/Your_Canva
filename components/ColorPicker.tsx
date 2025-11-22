"use client";

import { useColor } from "@/lib/utils/useColorContext";
import { useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import useEyeDropper from "use-eye-dropper";
import IconButton from "./IconButton";

type EyeDropperError = {
  canceled: boolean;
};

export default function ColorPicker(props: {
  type: "stroke" | "text" | "shape";
  top?: number;
  bottom?: number;
  width?: number | null;
  left?: number;
  right?: number;
  marginLeft?: number;
  marginRight?: number;
  translate?: string;
  marginTop?: number;
  onChangeColor?: (p: string) => void;
}) {
  const {
    penColor,
    setPenColor,
    textColor,
    setTextColor,
    shapeColor,
    setShapeColor,
  } = useColor();
  const { open, isSupported } = useEyeDropper();

  const color =
    props.type === "stroke"
      ? penColor
      : props.type === "text"
        ? textColor
        : shapeColor;

  const setColor =
    props.type === "stroke"
      ? setPenColor
      : props.type === "text"
        ? setTextColor
        : setShapeColor;

  const pickColor = useCallback(() => {
    const openPicker = async () => {
      try {
        const color = await open();
        setColor(color.sRGBHex);
        props.onChangeColor?.(color.sRGBHex);
      } catch (e) {
        const err = e as EyeDropperError;
        if (!err.canceled) return;
      }
    };
    openPicker();
  }, [open, setColor, props.onChangeColor]);

  return (
    <div
      style={{
        width: `${props.width}`,
      }}
    >
      <div
        className="color-picker-container"
        style={{
          top: `${props.top}px`,
          bottom: `${props.bottom}px`,
          left: `${props.left}%`,
          right: `${props.right}%`,
          translate: `-${props.translate}%`,
          marginTop: `${props.marginTop}px`,
          marginLeft: `${props.marginLeft}px`,
          marginRight: `${props.marginRight}px`,
          zIndex: "101",
        }}
      >
        <HexColorPicker
          color={color}
          onChange={(newColor) => {
            setColor(newColor);
            props.onChangeColor?.(newColor);
          }}
        />
        <div className="flex flex-row gap-3">
          <div className="flex flex-row items-center text-center gap-3 px-4 h-9 w-full border-2 border-[#FFC0C4] rounded-lg">
            <div
              className="w-5 h-5 rounded-full"
              style={{ background: color }}
            ></div>
            <p>{color}</p>
          </div>

          {isSupported() ? (
            <div
              onClick={pickColor}
              className="border-2 border-[#FFC0C4] min-w-9 h-9 rounded-lg"
            >
              <IconButton
                icon="colorize"
                scale={1}
                color="#1C1B1F"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
