import { shapePath } from "@/lib/board/shapes";
import type { ShapeType } from "@/lib/types";

/** Outline of a shape type, drawn from the same geometry the board uses. */
export default function ShapeIcon({ type, size = 24 }: { type: ShapeType; size?: number }) {
  const padding = 2;
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d={shapePath(type, size - 2 * padding, size - 2 * padding)} transform={`translate(${padding} ${padding})`} />
    </svg>
  );
}
