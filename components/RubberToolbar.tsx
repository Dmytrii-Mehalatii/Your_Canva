import RangeInput from "./RangeInput";

export default function RubberToolbar(props: {
  brushSize: number;
  setBrushSize: (p: number) => void;
  setClearAll: (p: boolean) => void;
}) {
  return (
    <div className="flex flex-row items-center w-[448px] gap-4 h-12 px-6 bg-white shadow-[0_2px_4px_0_rgba(255,192,196,1)] rounded-2xl absolute left-[50%] right-[50%] translate-x-[-50%] bottom-[132px]">
      <RangeInput
        brushSize={props.brushSize}
        setBrushSize={props.setBrushSize}
      />

      <div className="h-full w-[2px] bg-[#FFC0C4]" />

      <button
        className="bg-[#FF949C] h-8 w-[140px] text-white font-semibold rounded-lg text-center hover:cursor-pointer hover:bg-[#FF5763]"
        onClick={() => props.setClearAll(true)}
      >
        Clear All
      </button>
    </div>
  );
}
