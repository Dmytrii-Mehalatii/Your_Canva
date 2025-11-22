"use client";

import IconButton from "@/components/IconButton";
import { useEffect, useState } from "react";
import ColorPicker from "@/components/ColorPicker";
import { ShapeStroke } from "@/lib/types/CanvasTypes";

export default function ShapesSettings(props: {
  color: string;
  shapeStrokes: ShapeStroke[];
  shape: ShapeStroke;
  setShapeStrokes: React.Dispatch<React.SetStateAction<ShapeStroke[]>>;
  setShapeColor: (p: string) => void;
  index: number;
}) {
  const [openColorPicker, setOpenColorPicker] = useState<boolean>(false);
  const [openBorderWidthPicker, setOpenBorderWidthPicker] =
    useState<boolean>(false);
  const [openBorderStylePicker, setOpenBorderStylePicker] =
    useState<boolean>(false);

  const [borderWidth, setBorderWidth] = useState(props.shape.borderWidth);
  const [borderStyle, setBorderStyle] = useState(props.shape.borderStyle);

  useEffect(() => {
    if (props.index !== null) {
      props.setShapeStrokes((prev) =>
        prev.map((t, i) =>
          i === props.index ? { ...t, borderWidth: borderWidth } : t
        )
      );
    }
  }, [borderWidth]);

  useEffect(() => {
    if (props.index !== null) {
      props.setShapeStrokes((prev) =>
        prev.map((t, i) =>
          i === props.index ? { ...t, borderStyle: borderStyle } : t
        )
      );
    }
  }, [borderStyle]);

  return (
    <div
      style={{
        position: "absolute",
        left: `50%`,
        top: `40px`,
        zIndex: 9999,
        width: `1000px`,
        display: `flex`,
        justifyContent: "center",
        translate: `-50%`,
      }}
    >
      {openColorPicker && (
        <ColorPicker
          type="shape"
          top={60}
          left={35}
          right={55}
          translate="50"
          marginRight={0}
          onChangeColor={(newColor) => props.setShapeColor?.(newColor)}
        />
      )}

      {openBorderWidthPicker && (
        <div className=" absolute flex flex-col items-center mt-15 mr-[80px] gap-5 text-xl bg-white h-[140px] pt-2 w-[160px] rounded-2xl shadow-[0_2px_4px_0_rgba(255,192,196,1)] px-4 ">
          <div
            onClick={() => setBorderWidth(12)}
            className="w-full h-3 mt-4 bg-black cursor-pointer"
          ></div>
          <div
            onClick={() => setBorderWidth(8)}
            className="w-full h-2 bg-black cursor-pointer"
          ></div>
          <div
            onClick={() => setBorderWidth(4)}
            className="w-full h-1 bg-black cursor-pointer"
          ></div>
          <div
            onClick={() => setBorderWidth(0)}
            className="w-full text-center mt-[-8px] cursor-pointer"
          >
            none
          </div>
        </div>
      )}

      {openBorderStylePicker && (
        <div className=" absolute flex flex-col items-center mt-15 ml-14 gap-5 text-xl bg-white h-fit pt-2 w-[160px] rounded-2xl shadow-[0_2px_4px_0_rgba(255,192,196,1)] px-4 ">
          <div
            onClick={() => setBorderStyle("solid")}
            className="w-full h-3 mt-2 bg-black cursor-pointer"
          ></div>
          <div
            onClick={() => setBorderStyle("dashed")}
            className="w-full h-2 flex flex-row gap-2 cursor-pointer"
          >
            <div className=" bg-black w-full h-2"></div>
            <div className=" bg-black w-full h-2"></div>
            <div className=" bg-black w-full h-2"></div>
          </div>
          <div
            onClick={() => setBorderStyle("dotted")}
            className="w-full h-2 mb-4 flex flex-row gap-2 cursor-pointer"
          >
            <div className=" bg-black w-full h-2"></div>
            <div className=" bg-black w-full h-2"></div>
            <div className=" bg-black w-full h-2"></div>
            <div className=" bg-black w-full h-2"></div>
            <div className=" bg-black w-full h-2"></div>
            <div className=" bg-black w-full h-2"></div>
            <div className=" bg-black w-full h-2"></div>
            <div className=" bg-black w-full h-2"></div>
          </div>
        </div>
      )}

      <div className="flex flex-row items-center bg-white gap-2 h-[48px] min-w-[348px] max-w-[348px] rounded-2xl shadow-[0_2px_4px_0_rgba(255,192,196,1)] px-4  ">
        <div className="flex h-full items-center justify-center w-20">
          <div
            className="rounded-full h-7 w-7 border-[1px] border-gray-200 cursor-pointer"
            style={{ background: `${props.color}` }}
            onClick={() => {
              setOpenColorPicker(!openColorPicker);
              setOpenBorderWidthPicker(false);
              setOpenBorderStylePicker(false);
            }}
          ></div>

          {openColorPicker ? (
            <IconButton
              icon="keyboard_arrow_up"
              size={6}
              scale={1}
              color="#1C1B1F"
              onClick={() => {
                setOpenColorPicker(!openColorPicker);
                setOpenBorderWidthPicker(false);
                setOpenBorderStylePicker(false);
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
                setOpenBorderWidthPicker(false);
                setOpenBorderStylePicker(false);
              }}
            />
          )}
        </div>

        <div className="h-full w-[2px] bg-[#FFC0C4]" />

        <div className="flex items-center">
          <IconButton
            icon="line_weight"
            color="#1C1B1F"
            scale={1.6}
            thin={true}
            onClick={() => {
              props.setShapeStrokes((prev) =>
                prev.map((t: ShapeStroke, i: number) =>
                  i === props.index ? { ...t, borderWidth: borderWidth } : t
                )
              );
              setOpenBorderWidthPicker(!openBorderWidthPicker);
              setOpenColorPicker(false);
              setOpenBorderStylePicker(false);
            }}
          />
          <div className="ml-[-8px]">
            {openBorderWidthPicker ? (
              <IconButton
                icon="keyboard_arrow_up"
                size={6}
                scale={1}
                color="#1C1B1F"
                onClick={() => {
                  setOpenBorderWidthPicker(!openBorderWidthPicker);
                  setOpenColorPicker(false);
                  setOpenBorderStylePicker(false);
                }}
              />
            ) : (
              <IconButton
                icon="keyboard_arrow_down"
                size={6}
                scale={1}
                color="#1C1B1F"
                onClick={() => {
                  setOpenBorderWidthPicker(!openBorderWidthPicker);
                  setOpenColorPicker(false);
                  setOpenBorderStylePicker(false);
                }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center">
          <IconButton
            icon="line_style"
            color="#1C1B1F"
            scale={1.6}
            thin={true}
            onClick={() => {
              props.setShapeStrokes((prev) =>
                prev.map((t: ShapeStroke, i: number) =>
                  i === props.index ? { ...t, borderStyle: borderStyle } : t
                )
              );
              setOpenBorderStylePicker(!openBorderStylePicker);
              setOpenBorderWidthPicker(false);
              setOpenColorPicker(false);
            }}
          />
          <div className="ml-[-8px]">
            {openBorderStylePicker ? (
              <IconButton
                icon="keyboard_arrow_up"
                size={6}
                scale={1}
                color="#1C1B1F"
                onClick={() => {
                  setOpenBorderWidthPicker(false);
                  setOpenColorPicker(false);
                  setOpenBorderStylePicker(!openBorderStylePicker);
                }}
              />
            ) : (
              <IconButton
                icon="keyboard_arrow_down"
                size={6}
                scale={1}
                color="#1C1B1F"
                onClick={() => {
                  setOpenBorderWidthPicker(false);
                  setOpenColorPicker(false);
                  setOpenBorderStylePicker(!openBorderStylePicker);
                }}
              />
            )}
          </div>
        </div>

        <div className="h-full w-[2px] ml-1 bg-[#FFC0C4]" />

        <div className="ml-1">
          <IconButton
            icon="delete"
            color="#1C1B1F"
            scale={1.6}
            thin={true}
            onClick={() => {
              const newArr = props.shapeStrokes.filter(
                (_: ShapeStroke, i: number) => i !== props.index
              );
              props.setShapeStrokes(newArr);
              setOpenBorderWidthPicker(false);
              setOpenColorPicker(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
