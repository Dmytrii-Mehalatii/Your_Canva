import Image from "next/image";
import RangeInput from "./RangeInput";
import { useColor } from "@/lib/utils/useColorContext";
import { useState } from "react";
import ColorPicker from "./ColorPicker";

export default function PenToolbar(props: {
  brushSize: number;
  setBrushSize: (p: number) => void;
}) {
  const { setPenColor } = useColor();
  const [openColorPicker, setOpenColorPicker] = useState(false);
  return (
    <div>
      {openColorPicker && (
        <ColorPicker
          type="stroke"
          bottom={200}
          left={50}
          right={50}
          translate="-50"
          marginLeft={300}
          marginBottom={0}
        />
      )}
      <div className="flex flex-row items-center w-[688px] h-12 bg-white px-6 gap-4 shadow-[0_2px_4px_0_rgba(255,192,196,1)] rounded-2xl absolute left-[50%] right-[50%] translate-x-[-50%] bottom-[132px]">
        <RangeInput
          brushSize={props.brushSize}
          setBrushSize={props.setBrushSize}
        />

        <div className="h-full w-[2px] bg-[#FFC0C4]" />

        <div className="flex flex-row items-center h-full gap-4 ">
          <div
            className="bg-black rounded-full min-w-7 min-h-7 cursor-pointer"
            onClick={() => {
              setPenColor("black");
              setOpenColorPicker(false);
            }}
          ></div>
          <div
            className="bg-[#D7000F] border-1 border-[#B1030F] rounded-full min-w-7 min-h-7 cursor-pointer"
            onClick={() => {
              setPenColor("#D7000F");
              setOpenColorPicker(false);
            }}
          ></div>
          <div
            className="bg-[#FF6A00] border-1 border-[#D05700] rounded-full min-w-7 min-h-7 cursor-pointer"
            onClick={() => {
              setPenColor("#FF6A00");
              setOpenColorPicker(false);
            }}
          ></div>
          <div
            className="bg-[#FFD900] border-1 border-[#DDBC00] rounded-full min-w-7 min-h-7 cursor-pointer"
            onClick={() => {
              setPenColor("#FFD900");
              setOpenColorPicker(false);
            }}
          ></div>
          <div
            className="bg-[#9FF32A] border-1 border-[#7ACE04] rounded-full min-w-7 min-h-7 cursor-pointer"
            onClick={() => {
              setPenColor("#9FF32A");
              setOpenColorPicker(false);
            }}
          ></div>
          <div
            className="bg-[#22C4FF] border-1 border-[#0A9CD2] rounded-full min-w-7 min-h-7 cursor-pointer"
            onClick={() => {
              setPenColor("#22C4FF");
              setOpenColorPicker(false);
            }}
          ></div>
          <div
            className="bg-[#1301B8] border-1 border-[#0D0081] rounded-full min-w-7 min-h-7 cursor-pointer"
            onClick={() => {
              setPenColor("#1301B8");
              setOpenColorPicker(false);
            }}
          ></div>
          <div
            className="bg-white border-1 border-[#B3B3B3] rounded-full min-w-7 min-h-7 cursor-pointer"
            onClick={() => {
              setPenColor("white");
              setOpenColorPicker(false);
            }}
          ></div>
          <Image
            src={"/colorPallete.png"}
            alt="color pallete"
            width={28}
            height={28}
            className="border-1 border-[#CDCDCD] rounded-full cursor-pointer "
            onClick={() => setOpenColorPicker(!openColorPicker)}
          />
        </div>
      </div>
    </div>
  );
}
