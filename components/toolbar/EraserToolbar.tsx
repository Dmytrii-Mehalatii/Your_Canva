import BrushSizeSlider from "@/components/ui/BrushSizeSlider";
import Divider from "@/components/ui/Divider";
import FloatingBar from "@/components/ui/FloatingBar";

type Props = {
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onClearAll: () => void;
};

export default function EraserToolbar({ brushSize, onBrushSizeChange, onClearAll }: Props) {
  return (
    <FloatingBar position="bottom" className="gap-4 px-6">
      <BrushSizeSlider value={brushSize} onChange={onBrushSizeChange} />
      <Divider />
      <button
        type="button"
        className="h-8 w-[140px] cursor-pointer rounded-lg bg-[#FF949C] text-center font-semibold text-white hover:bg-[#FF5763]"
        onClick={onClearAll}
      >
        Clear All
      </button>
    </FloatingBar>
  );
}
