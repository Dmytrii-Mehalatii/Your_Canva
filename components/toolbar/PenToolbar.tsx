import Image from "next/image";
import { useState } from "react";
import BrushSizeSlider from "@/components/ui/BrushSizeSlider";
import ColorPicker from "@/components/ui/ColorPicker";
import Divider from "@/components/ui/Divider";
import FloatingBar from "@/components/ui/FloatingBar";
import MenuButton from "@/components/ui/MenuButton";
import { PEN_PALETTE } from "@/lib/constants";

type Props = {
  brushSize: number;
  color: string;
  onBrushSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
};

export default function PenToolbar({ brushSize, color, onBrushSizeChange, onColorChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <FloatingBar position="bottom" className="gap-4 px-6">
      <BrushSizeSlider value={brushSize} onChange={onBrushSizeChange} />
      <Divider />
      <div className="flex flex-wrap items-center gap-4 max-sm:gap-2">
        {PEN_PALETTE.map((swatch) => (
          <button
            key={swatch.fill}
            type="button"
            aria-label={`Pen color ${swatch.fill}`}
            className={`size-7 shrink-0 cursor-pointer rounded-full border max-sm:size-6 ${swatch.fill === color ? "ring-2 ring-blush ring-offset-2" : ""}`}
            style={{ background: swatch.fill, borderColor: swatch.border }}
            onClick={() => {
              onColorChange(swatch.fill);
              setPickerOpen(false);
            }}
          />
        ))}
        <MenuButton
          label="Custom color"
          chevron={false}
          open={pickerOpen}
          onToggle={() => setPickerOpen((open) => !open)}
          menu={<ColorPicker color={color} onChange={onColorChange} placement="above" />}
        >
          <Image src="/colorPallete.png" alt="" width={28} height={28} className="rounded-full border border-[#CDCDCD]" />
        </MenuButton>
      </div>
    </FloatingBar>
  );
}
