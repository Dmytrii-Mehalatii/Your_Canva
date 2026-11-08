import Image from "next/image";
import { BAR_POSITION } from "@/components/ui/FloatingBar";
import { STICKERS } from "@/lib/constants";
import type { Sticker } from "@/lib/types";

/** Distance from the wheel's center to each sticker slot, in pixels. */
const SLOT_RADIUS = 87;

type Props = {
  selected: Sticker | null;
  onSelect: (sticker: Sticker) => void;
};

export default function StickerToolbar({ selected, onSelect }: Props) {
  return (
    <div className={`absolute ${BAR_POSITION.bottom} left-1/2 h-60 w-60 -translate-x-1/2 rounded-full md:ml-48 bg-[conic-gradient(#ffecec_0deg_45deg,#fff7f7_45deg_90deg,#ffecec_90deg_135deg,#fff7f7_135deg_180deg,#ffecec_180deg_225deg,#fff7f7_225deg_270deg,#ffecec_270deg_315deg,#fff7f7_315deg_360deg)] shadow-panel`}>
      <div className="absolute top-1/2 left-1/2 z-10 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-300 bg-white" />
      <div className="absolute inset-0 flex items-center justify-center">
        {STICKERS.map(({ thumb, ...sticker }, index) => {
          // Eight slots centered in the wheel's segments, clockwise from the top-left one.
          const angle = ((index - 2.5) * 45 * Math.PI) / 180;
          const x = Math.cos(angle) * SLOT_RADIUS;
          const y = Math.sin(angle) * SLOT_RADIUS;
          return (
            <button
              key={sticker.src}
              type="button"
              aria-label={sticker.name}
              title={sticker.name}
              className={`absolute cursor-pointer rounded-xl ${selected?.src === sticker.src ? "ring-2 ring-brand" : ""}`}
              style={{ translate: `${x}px ${y}px` }}
              onClick={() => onSelect(sticker)}
            >
              <Image src={sticker.src} alt="" width={thumb.width} height={thumb.height} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
