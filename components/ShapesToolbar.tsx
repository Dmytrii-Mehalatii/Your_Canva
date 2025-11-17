import { useColor } from "@/lib/utils/useColorContext";
import { useState } from "react";
import ColorPicker from "./ColorPicker";
import IconButton from "./IconButton";

export default function ShapesToolbar() {
  const { shapeColor } = useColor();
  const [openColorPicker, setOpenColorPicker] = useState(false);
  return (
    <div>
      {openColorPicker && (
        <ColorPicker
          type="shape"
          bottom={200}
          left={45}
          right={55}
          translate="50"
          marginRight={200}
        />
      )}
      <div className="flex flex-row items-center w-[340px] h-12 bg-white px-6 gap-4 shadow-[0_2px_4px_0_rgba(255,192,196,1)] rounded-2xl absolute left-[50%] right-[50%] translate-x-[-50%] bottom-[132px]">
        <div className="flex flex-row items-center h-full gap-1 ">
          <div
            className="rounded-full min-w-7 min-h-7 cursor-pointer"
            style={{ background: `${shapeColor}` }}
            onClick={() => {
              setOpenColorPicker(!openColorPicker);
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

        <div className="flex flex-row gap-5">
          <IconButton
            icon="crop_square"
            size={6}
            scale={1.3}
            color="#1C1B1F"
          />
          <IconButton
            icon="circle"
            size={6}
            scale={1.3}
            color="#1C1B1F"
          />
          <IconButton
            icon="change_history"
            size={6}
            scale={1.3}
            color="#1C1B1F"
          />
          <div className=" rotate-45">
            <IconButton
              icon="crop_square"
              size={6}
              scale={1.3}
              color="#1C1B1F"
            />
          </div>
          <IconButton
            icon="kid_star"
            size={6}
            scale={1.3}
            color="#1C1B1F"
          />
        </div>
      </div>
    </div>
  );
}
