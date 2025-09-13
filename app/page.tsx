"use client";

import Canva from "@/components/canva/page";
import { useCursor } from "@/lib/utils/useCursor";
import { useState } from "react";
import "material-symbols";

export default function Home() {
  const position = useCursor();

  const [draw, setDraw] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(6);
  const [color, setColor] = useState<string>("black");
  return (
    <div>
      <button
        className="absolute top-20 left-10 bg-black text-white p-2 m-2 rounded"
        onClick={() => setDraw(!draw)}
      >
        Start Drawing
      </button>
      {draw && (
        <div className="absolute top-22 left-45 flex flex-col gap-2">
          <button
            className="bg-black text-white p-2  rounded"
            onClick={() => setBrushSize(6)}
          >
            6px
          </button>
          <button
            className="bg-black text-white p-2  rounded"
            onClick={() => setBrushSize(12)}
          >
            12px
          </button>
          <button
            className="bg-black text-white p-2 rounded"
            onClick={() => setBrushSize(20)}
          >
            20px
          </button>

          <div className="flex flex-col items-center border-2 border-black w-13 ">
            <div
              className=" rounded-full bg-green-800 w-8 h-8 m-1 cursor-pointer"
              onClick={() => setColor("green")}
            ></div>
            <div
              className=" rounded-full bg-red-600 w-8 h-8 m-1 cursor-pointer"
              onClick={() => setColor("red")}
            ></div>
            <div
              className=" rounded-full bg-blue-700 w-8 h-8 m-1 cursor-pointer"
              onClick={() => setColor("blue")}
            ></div>
            <div
              className=" rounded-full bg-black w-8 h-8 m-1 cursor-pointer"
              onClick={() => setColor("black")}
            ></div>
          </div>
        </div>
      )}
      <div className="border-2 border-black w-[1000px] h-[1000px]">
        <Canva
          draw={draw}
          brushSize={brushSize}
          color={color}
        />
      </div>
      <h1>
        x: {position.x} y: {position.y}
      </h1>
    </div>
  );
}
