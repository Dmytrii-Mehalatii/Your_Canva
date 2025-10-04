export default function RangeInput(props: {
  brushSize?: number;
  setBrushSize?: (line: number) => void;
}) {
  return (
    <div className="flex flex-row items-center gap-4 px-6 w-full h-full">
      <input
        type="range"
        min={1}
        max={60}
        defaultValue={props.brushSize}
        step="any"
        onChange={(e) => props.setBrushSize?.(e.target.valueAsNumber)}
        className="w-[170px] h-full accent-[#1C1B1F] cursor-pointer
        appearance-none bg-transparent
           [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-[#1C1B1F] [&::-webkit-slider-runnable-track]:rounded-full
           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1C1B1F] [&::-webkit-slider-thumb]:mt-[-6px]
           [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-[#1C1B1F] [&::-moz-range-track]:rounded-full
           [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-1 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#1C1B1F]
        "
      />
      <p className="text-md font-medium">{props.brushSize?.toFixed(0)} px</p>
    </div>
  );
}
