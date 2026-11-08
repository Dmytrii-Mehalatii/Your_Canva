import { useState } from "react";
import ColorMenu from "@/components/ui/ColorMenu";
import Divider from "@/components/ui/Divider";
import FloatingBar from "@/components/ui/FloatingBar";
import IconButton from "@/components/ui/IconButton";
import ShapeIcon from "@/components/ui/ShapeIcon";
import type { ShapeStyle, ShapeType } from "@/lib/types";

const SHAPE_OPTIONS: { type: ShapeType; label: string }[] = [
  { type: "square", label: "Square" },
  { type: "circle", label: "Circle" },
  { type: "rhombus", label: "Rhombus" },
  { type: "triangle", label: "Triangle" },
  { type: "hexagon", label: "Hexagon" },
  { type: "star", label: "Star" },
  { type: "arrow", label: "Arrow" },
  { type: "heart", label: "Heart" },
];

type Props = {
  shape: ShapeStyle;
  onChange: (patch: Partial<ShapeStyle>) => void;
};

export default function ShapesToolbar({ shape, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <FloatingBar position="bottom" className="gap-4 px-6">
      <ColorMenu
        label="Shape color"
        color={shape.color}
        open={pickerOpen}
        onToggle={() => setPickerOpen((open) => !open)}
        onChange={(color) => onChange({ color })}
        placement="above"
      />
      <Divider />
      <div className="ml-1 flex min-w-0 flex-1 flex-wrap gap-2 py-1">
        {SHAPE_OPTIONS.map((option) => (
          <IconButton
            key={option.type}
            icon={<ShapeIcon type={option.type} size={26} />}
            label={option.label}
            size="fill"
            active={option.type === shape.type}
            className={`min-w-10 ${option.type === shape.type ? "bg-blush" : ""}`}
            onClick={() => onChange({ type: option.type })}
          />
        ))}
      </div>
    </FloatingBar>
  );
}
