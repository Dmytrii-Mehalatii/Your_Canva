import { BRUSH_SIZE } from "@/lib/constants";

type Props = { value: number; onChange: (size: number) => void };

export default function BrushSizeSlider({ value, onChange }: Props) {
  return (
    <div className="flex h-full w-fit items-center gap-4">
      <input
        type="range"
        aria-label="Brush size"
        min={BRUSH_SIZE.min}
        max={BRUSH_SIZE.max}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="h-full w-[170px] cursor-pointer appearance-none bg-transparent accent-ink
          [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-ink
          [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink
          [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-ink
          [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-ink"
      />
      <p className="text-md min-w-11 font-medium">{value.toFixed(0)} px</p>
    </div>
  );
}
