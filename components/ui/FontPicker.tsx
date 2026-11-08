import { FONT_OPTIONS } from "@/lib/fonts";
import Dropdown from "./Dropdown";

type Props = {
  value: string;
  onSelect: (fontName: string) => void;
};

export default function FontPicker({ value, onSelect }: Props) {
  return (
    <Dropdown className="h-[196px] w-40 items-center justify-center gap-4 px-4 text-xl">
      {FONT_OPTIONS.map((font) => (
        <button
          key={font.name}
          type="button"
          title={font.name}
          style={{ fontFamily: font.family }}
          className={`cursor-pointer ${font.name === value ? "text-brand" : ""}`}
          onClick={() => onSelect(font.name)}
        >
          Abcdefgh
        </button>
      ))}
    </Dropdown>
  );
}
