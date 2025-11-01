"use client";

import ColorPicker from "@/components/ColorPicker";
import IconButton from "@/components/IconButton";
import { useState } from "react";

export default function TextSettings(props: {
  left: number;
  customTop: number | undefined;
  scale: number;
  textareaWidth: number | null;
  textColor: any;
  setTextColor: (p: string) => void;
}) {
  const [openColorPicker, setOpenColorPicker] = useState<boolean>(false);
  return (
    <div
      style={{
        position: "absolute",
        left: `${props.left}px`,
        top: `${props.customTop}px`,
        zIndex: 9999,
        minWidth: `${50 * props.scale}px`,
        maxWidth: `${600 * props.scale}px`,
        width: `${props.textareaWidth}px`,
      }}
    >
      {openColorPicker && (
        <ColorPicker
          bottom={0}
          left={0}
          right={0}
          translate="0"
          marginLeft={0}
          marginBottom={68}
          type="text"
          onChangeColor={(newColor) => props.setTextColor?.(newColor)}
        />
      )}
      <div className="flex flex-row items-center bg-white gap-2 h-[48px] min-w-[520px] max-w-[520px] rounded-2xl shadow-[0_2px_4px_0_rgba(255,192,196,1)] px-4  ">
        <div className="flex h-full items-center justify-center w-20">
          <div
            className="rounded-full h-7 w-7"
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
  );
}
