import Image from "next/image";
import RangeInput from "./RangeInput";
import { useColor } from "@/lib/utils/useColorContext";

export default function PenToolbar(props: {
  brushSize: number;
  setBrushSize: (p: number) => void;
}) {
  const { setColor } = useColor();

  return (
    <div className="flex flex-row items-center w-[750px] h-12 bg-white px-2 shadow-[0_2px_4px_0_rgba(255,192,196,1)] rounded-2xl absolute left-[50%] right-[50%] translate-x-[-50%] bottom-[132px]">
      <RangeInput
        brushSize={props.brushSize}
        setBrushSize={props.setBrushSize}
      />

      <div className="h-full w-[2px] bg-[#FFC0C4]" />

      <div className="flex flex-row items-center px-5 h-full gap-5">
        <div
          className="bg-black rounded-full h-[28px] w-[28px] cursor-pointer"
          onClick={() => setColor("black")}
        ></div>
        <div
          className="bg-[#D7000F] border-1 border-[#B1030F] rounded-full h-[28px] w-[28px] cursor-pointer"
          onClick={() => setColor("#D7000F")}
        ></div>
        <div
          className="bg-[#FF6A00] border-1 border-[#D05700] rounded-full h-[28px] w-[28px] cursor-pointer"
          onClick={() => setColor("#FF6A00")}
        ></div>
        <div
          className="bg-[#FFD900] border-1 border-[#DDBC00] rounded-full h-[28px] w-[28px] cursor-pointer"
          onClick={() => setColor("#FFD900")}
        ></div>
        <div
          className="bg-[#9FF32A] border-1 border-[#7ACE04] rounded-full h-[28px] w-[28px] cursor-pointer"
          onClick={() => setColor("#9FF32A")}
        ></div>
        <div
          className="bg-[#22C4FF] border-1 border-[#0A9CD2] rounded-full h-[28px] w-[28px] cursor-pointer"
          onClick={() => setColor("#22C4FF")}
        ></div>
        <div
          className="bg-[#1301B8] border-1 border-[#0D0081] rounded-full h-[28px] w-[28px] cursor-pointer"
          onClick={() => setColor("#1301B8")}
        ></div>
        <div
          className="bg-white border-1 border-[#B3B3B3] rounded-full h-[28px] w-[28px] cursor-pointer"
          onClick={() => setColor("white")}
        ></div>
        <Image
          src={"/colorPallete.png"}
          alt="color pallete"
          width={28}
          height={28}
          className="border-1 border-[#CDCDCD] rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
}
