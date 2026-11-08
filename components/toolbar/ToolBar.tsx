import type { ReactNode } from "react";
import EraserIcon from "@/components/icons/EraserIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import Divider from "@/components/ui/Divider";
import type { IconName } from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import type { Tool } from "@/lib/types";

type Props = {
  tool: Tool;
  /** Which secondary toolbar is open, if any. */
  panel: Tool | null;
  penColor: string;
  onSelectTool: (tool: Tool) => void;
};

/** The pencil and eraser artwork is tall; it is sized down on phones so the bar still fits. */
const DRAWING_ICON = "h-[100px] w-[105px] max-sm:h-14 max-sm:w-auto";

export default function ToolBar({ tool, panel, penColor, onSelectTool }: Props) {
  const toolButton = (target: Tool, icon: IconName, label: string) => (
    <div className="flex min-w-0 flex-1 justify-center self-center">
      <IconButton icon={icon} label={label} active={tool === target} onClick={() => onSelectTool(target)} />
    </div>
  );

  return (
    <div className="panel absolute bottom-12 left-1/2 z-30 flex h-[60px] w-[508px] max-w-[calc(100vw-1rem)] -translate-x-1/2 items-end px-2">
      {toolButton("select", "arrow_selector_tool", "Select")}
      <Divider />
      <div className="flex h-20 min-w-0 flex-[2] items-center justify-center max-sm:h-16">
        <DrawingToolButton label="Pen" raised={panel === "pen"} onClick={() => onSelectTool("pen")}>
          <PencilIcon className={DRAWING_ICON} color={penColor} />
        </DrawingToolButton>
        <DrawingToolButton label="Eraser" raised={panel === "eraser"} onClick={() => onSelectTool("eraser")}>
          <EraserIcon className={DRAWING_ICON} color={penColor} />
        </DrawingToolButton>
      </div>
      <Divider />
      {toolButton("shape", "shapes", "Shapes")}
      {toolButton("text", "title", "Text")}
      {toolButton("sticker", "add_reaction", "Stickers")}
    </div>
  );
}

/** The pencil and eraser poke out of the bar and rise when their toolbar is open; the button clips their lower half. */
function DrawingToolButton(props: { label: string; raised: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      onClick={props.onClick}
      className="flex h-full w-1/2 cursor-pointer items-center justify-center overflow-clip"
    >
      <span
        className={`transition-transform duration-150 ${props.raised ? "translate-y-3 max-sm:translate-y-1" : "translate-y-8 max-sm:translate-y-4"}`}
      >
        {props.children}
      </span>
    </button>
  );
}
