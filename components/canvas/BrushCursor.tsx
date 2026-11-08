import type { Point } from "@/lib/types";

/** Circle previewing the brush footprint. `position` is in canvas pixels and `size` is already scaled to the viewport. */
export default function BrushCursor({ position, size }: { position: Point; size: number }) {
  return (
    <div
      className="pointer-events-none absolute z-40 rounded-full border border-gray-900 opacity-80"
      style={{ left: position.x - size / 2, top: position.y - size / 2, width: size, height: size }}
    />
  );
}
