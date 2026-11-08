import IconButton from "@/components/ui/IconButton";
import { rectToScreen } from "@/lib/board/geometry";
import type { StickerItem, Viewport } from "@/lib/types";

type Props = { sticker: StickerItem; viewport: Viewport; onDelete: () => void };

/** Delete handle pinned to the selected sticker's top-right corner. */
export default function StickerSettings({ sticker, viewport, onDelete }: Props) {
  const { x, y, width } = rectToScreen(sticker, viewport);
  return (
    <div className="absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-blush" style={{ left: x + width, top: y }}>
      <IconButton icon="delete" label="Delete sticker" active size="sm" iconSize={28} onClick={onDelete} />
    </div>
  );
}
