"use client";

import ColorPicker from "@/components/ColorPicker";
import FontPicker from "@/components/FontPicker";
import IconButton from "@/components/IconButton";
import { TextStroke } from "@/lib/types/CanvasTypes";
import { useFont } from "@/lib/utils/useFontContext";
import { useState } from "react";

export default function TextSettings(props: {
  scale: number;
  index: number;
  textStrokes: TextStroke[];
  setTextStrokes: (p: TextStroke[]) => void;
  textareaWidth: number | null;
  textColor: { color: string };
  setTextColor: (p: string) => void;
  textSize: number;
  setTextSize: (p: number) => void;
}) {
  const [openColorPicker, setOpenColorPicker] = useState<boolean>(false);
  const [openFontPicker, setOpenFontPicker] = useState<boolean>(false);

  const { fontSize, setFontSize } = useFont();

  return (
    <div
      style={{
        position: "absolute",
        left: `50%`,
        top: `40px`,
        zIndex: 9999,
        minWidth: `${50 * props.scale}px`,
        maxWidth: `${800 * props.scale}px`,
        width: `1000px`,
        display: `flex`,
        justifyContent: "center",
        translate: `-50%`,
      }}
    >
      {openColorPicker && (
        <ColorPicker
          translate="30"
          type="text"
          marginTop={68}
          onChangeColor={(newColor) => props.setTextColor?.(newColor)}
        />
      )}

      {openFontPicker && <FontPicker translate="45" />}
      <div className="flex flex-row items-center bg-white gap-2 h-[48px] min-w-[400px] max-w-[400px] rounded-2xl shadow-[0_2px_4px_0_rgba(255,192,196,1)] px-4  ">
        <div className="flex h-full items-center justify-center w-20">
          <div
            className="rounded-full h-7 w-7 border-[1px] border-gray-200"
            style={{ background: `${props.textColor.color}` }}
          ></div>
          {openColorPicker ? (
            <IconButton
              icon="keyboard_arrow_up"
              size={6}
              scale={1}
              color="#1C1B1F"
              onClick={() => {
                setOpenColorPicker(!openColorPicker);
              }}
            />
          ) : (
            <IconButton
              icon="keyboard_arrow_down"
              size={6}
              scale={1}
              color="#1C1B1F"
              onClick={() => {
                setOpenColorPicker(!openColorPicker);
                setOpenFontPicker(false);
              }}
            />
          )}
        </div>
        <div className="h-full w-[2px] bg-[#FFC0C4]" />
        <div className="flex h-full items-center justify-center w-20">
          <IconButton
            icon="match_case"
            color="#1C1B1F"
          />
          {openFontPicker ? (
            <IconButton
              icon="keyboard_arrow_up"
              size={6}
              scale={1}
              color="#1C1B1F"
              onClick={() => {
                setOpenFontPicker(!openFontPicker);
              }}
            />
          ) : (
            <IconButton
              icon="keyboard_arrow_down"
              size={6}
              scale={1}
              color="#1C1B1F"
              onClick={() => {
                setOpenFontPicker(!openFontPicker);
                setOpenColorPicker(false);
              }}
            />
          )}
        </div>
        <div className="h-full w-[2px] bg-[#FFC0C4]" />
        <div className="flex h-full items-center justify-center w-[108px] gap-3">
          <IconButton
            icon="check_indeterminate_small"
            size={6}
            scale={1}
            color="#1C1B1F"
            onClick={() => {
              if (fontSize > 1) {
                setFontSize(fontSize - 1);
              }
              setOpenFontPicker(false);
              setOpenColorPicker(false);
            }}
          />
          <input
            type="number"
            value={props.textSize}
            onChange={(e) => props.setTextSize(Number(e.target.value))}
            className="max-w-[26px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ width: `${String(props.textSize).length}ch` }}
            min={1}
            max={120}
          />
          <IconButton
            icon="add"
            size={6}
            scale={1}
            color="#1C1B1F"
            onClick={() => {
              setFontSize(fontSize + 1);
              setOpenFontPicker(false);
              setOpenColorPicker(false);
            }}
          />
        </div>
        <div className="h-full w-[2px] bg-[#FFC0C4]" />
        <IconButton
          icon="delete"
          color="#1C1B1F"
          scale={1.6}
          thin={true}
          onClick={() => {
            const newArr = props.textStrokes.filter(
              (_: TextStroke, i: number) => i !== props.index
            );
            props.setTextStrokes(newArr);
          }}
        />
      </div>
    </div>
  );
}
