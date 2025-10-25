import IconButton from "./IconButton";
import BlackPencil from "./BlackPencil";
import { useColor } from "@/lib/utils/useColorContext";
import BlackRubber from "./BlackRubber";

export default function ToolBar(props: {
  draw: boolean;
  setDraw: (p: boolean) => void;
  drawIn: boolean;
  setDrawIn: (p: boolean) => void;
  rabOut: boolean;
  setRabOut: (p: boolean) => void;
  tool: "pen" | "rubber" | "text" | "other";
  setTool: (p: "pen" | "rubber" | "text" | "other") => void;
}) {
  const { color } = useColor();
  return (
    <div className="bg-white w-[572px] h-[60px] rounded-2xl shadow-[0_2px_4px_0_rgba(255,192,196,1)] absolute flex flex-row right-[50%] left-[50%] translate-x-[-50%] bottom-[48px] px-2 items-end">
      <IconButton
        icon="arrow_selector_tool"
        color="#D7000F"
        bigBox={true}
        onClick={() => {
          props.setDraw(false);
          props.setRabOut(false);
          props.setDrawIn(false);
          props.setTool("other");
        }}
      />

      <div className="h-full w-[2px] bg-[#FFC0C4]" />

      <div className="flex items-center justify-center w-40 h-[80px]">
        <button
          className="w-1/2 flex items-center justify-center h-full overflow-clip"
          onClick={() => {
            props.setDraw(true);
            props.setDrawIn(!props.drawIn);
            props.setRabOut(false);
            props.setTool("pen");
          }}
        >
          <BlackPencil
            width={105}
            height={100}
            color={color}
            className={`transition-all duration-150 hover:cursor-pointer ${props.drawIn ? "translate-y-3" : "translate-y-8"}`}
          />
        </button>

        <button
          className="w-1/2 flex items-center justify-center h-full overflow-clip"
          onClick={() => {
            props.setRabOut(!props.rabOut);
            props.setDraw(true);
            props.setDrawIn(false);
            props.setTool("rubber");
          }}
        >
          <BlackRubber
            width={105}
            height={100}
            color={color}
            className={`transition-all duration-150 hover:cursor-pointer ${props.rabOut ? "translate-y-3" : "translate-y-8"}`}
          />
        </button>
      </div>

      <div className="h-full w-[2px] bg-[#FFC0C4]" />

      <IconButton
        icon="sticky_note"
        color="#D7000F"
        bigBox={true}
      />

      <IconButton
        icon="shapes"
        color="#D7000F"
        bigBox={true}
      />

      <IconButton
        icon="title"
        color="#D7000F"
        bigBox={true}
        onClick={() => {
          props.setDraw(false);
          props.setRabOut(false);
          props.setDrawIn(false);
          props.setTool("text");
        }}
      />

      <IconButton
        icon="add_reaction"
        color="#D7000F"
        bigBox={true}
      />
    </div>
  );
}
