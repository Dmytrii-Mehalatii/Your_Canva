import RangeInput from "./RangeInput";

export default function RubberToolbar(props: {
  brushSize: number;
  setBrushSize: (p: number) => void;
}) {
  return (
    <div className="flex flex-row items-center w-[278px] h-12 bg-white shadow-[0_2px_4px_0_rgba(255,192,196,1)] rounded-2xl absolute left-[50%] right-[50%] translate-x-[-50%] bottom-[132px]">
      <RangeInput
        brushSize={props.brushSize}
        setBrushSize={props.setBrushSize}
      />
    </div>
  );
}
