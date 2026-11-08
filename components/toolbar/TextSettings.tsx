import { useState } from "react";
import ColorMenu from "@/components/ui/ColorMenu";
import Divider from "@/components/ui/Divider";
import FloatingBar from "@/components/ui/FloatingBar";
import FontPicker from "@/components/ui/FontPicker";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import MenuButton from "@/components/ui/MenuButton";
import { FONT_SIZE } from "@/lib/constants";
import { useMenu } from "@/lib/hooks/useMenu";
import type { TextItem, TextStyle } from "@/lib/types";
import { clamp } from "@/lib/utils";

type Props = {
  text: TextItem;
  onChange: (patch: Partial<TextStyle>) => void;
  onDelete: () => void;
};

export default function TextSettings({ text, onChange, onDelete }: Props) {
  const menu = useMenu<"color" | "font">();
  /** What the size field shows while being edited, so it can be emptied without snapping back. */
  const [sizeDraft, setSizeDraft] = useState<string | null>(null);
  const sizeText = sizeDraft ?? String(text.fontSize);

  const setFontSize = (size: number) => {
    if (!Number.isNaN(size)) onChange({ fontSize: clamp(size, FONT_SIZE.min, FONT_SIZE.max) });
  };

  return (
    <FloatingBar position="top" className="gap-2 px-4">
      <ColorMenu
        label="Text color"
        color={text.color}
        open={menu.open === "color"}
        onToggle={() => menu.toggle("color")}
        onChange={(color) => onChange({ color })}
        className="w-20 justify-center"
      />

      <Divider />

      <MenuButton
        label="Font"
        open={menu.open === "font"}
        onToggle={() => menu.toggle("font")}
        className="w-20 justify-center"
        menu={
          <FontPicker
            value={text.font}
            onSelect={(font) => {
              onChange({ font });
              menu.close();
            }}
          />
        }
      >
        <Icon name="match_case" size={40} />
      </MenuButton>

      <Divider />

      <div className="flex h-full w-[108px] items-center justify-center gap-3">
        <IconButton icon="check_indeterminate_small" label="Smaller text" size="xs" iconSize={24} onClick={() => setFontSize(text.fontSize - 1)} />
        <input
          type="number"
          aria-label="Font size"
          value={sizeText}
          min={FONT_SIZE.min}
          max={FONT_SIZE.max}
          className="w-[3ch] text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={(e) => {
            setSizeDraft(e.target.value);
            setFontSize(e.target.valueAsNumber);
          }}
          onBlur={() => setSizeDraft(null)}
        />
        <IconButton icon="add" label="Larger text" size="xs" iconSize={24} onClick={() => setFontSize(text.fontSize + 1)} />
      </div>

      <Divider />
      <IconButton icon="delete" label="Delete text" iconSize={38} onClick={onDelete} />
    </FloatingBar>
  );
}
