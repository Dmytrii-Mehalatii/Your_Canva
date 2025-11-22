import IconButton from "@/components/IconButton";
import { StickerStroke } from "@/lib/types/CanvasTypes";
import { useRef } from "react";

export default function StickerSettings(props: {
  viewport?: { x: number; y: number; scale: number };
  selectedStickerIndex: number;
  setSelectedStickerIndex: (p: number | null) => void;
  stickerStrokes: StickerStroke[];
  setStickerStrokes: (p: StickerStroke[]) => void;
}) {
  const settingsRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      {props.stickerStrokes.map((sticker: StickerStroke, index: number) => {
        const scale = props.viewport?.scale ?? 1;

        let customLeft;
        let customScaleTop;
        let customScaleLeft;

        if (sticker.width === 70) {
          customLeft = 10;
        } else if (sticker.width === 80) {
          customLeft = 15;
        } else if (sticker.width === 100) {
          customLeft = 25;
        } else {
          customLeft = 45;
        }

        if (scale > 0.5 && 0.8 > scale) {
          customScaleTop = 10;
          customScaleLeft = -5;
        } else {
          customScaleTop = 20;
          customScaleLeft = -10;
        }
        if (!sticker.points || sticker.points.length === 0) return null;
        const left =
          (sticker.points[0].x + customLeft) * scale + (props.viewport?.x ?? 0);
        const top = sticker.points[0].y * scale + (props.viewport?.y ?? 0);
        if (index === props.selectedStickerIndex) {
          console.log(sticker.left);
        }
        return (
          <div key={index}>
            {index === props.selectedStickerIndex && (
              <div
                ref={settingsRef}
                style={{
                  position: "absolute",
                  top: top - customScaleTop,
                  left: left - customScaleLeft,
                  zIndex: 9999,
                  pointerEvents: "auto",
                }}
              >
                {scale > 0.5 && (
                  <div
                    className="bg-[#FFC0C4]"
                    style={{
                      width: `${32 * scale}px`,
                      height: `${32 * scale}px`,
                      borderRadius: `${8 * scale}px`,
                    }}
                  >
                    <IconButton
                      icon="delete"
                      color="#D7000F"
                      scale={1.2 * (props.viewport?.scale ?? 1)}
                      thin={true}
                      onClick={() => {
                        const newArr = props.stickerStrokes.filter(
                          (_: StickerStroke, i: number) =>
                            i !== props.selectedStickerIndex
                        );
                        props.setStickerStrokes(newArr);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            <div></div>
          </div>
        );
      })}
    </>
  );
}
