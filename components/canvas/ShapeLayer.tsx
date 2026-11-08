import { rectToScreen } from "@/lib/board/geometry";
import { shapePath } from "@/lib/board/shapes";
import type { BorderStyle, Rect, ShapeItem, ShapeStyle, Viewport } from "@/lib/types";

type Props = {
  shapes: ShapeItem[];
  viewport: Viewport;
  /** Outline of the shape currently being dragged out. */
  draft: (Rect & ShapeStyle) | null;
};

/** Shapes are SVG paths that sit underneath the ink canvas; their strokes carry the border settings. */
export default function ShapeLayer({ shapes, viewport, draft }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {shapes.map((shape) => (
        <ShapeView key={shape.id} shape={shape} viewport={viewport} />
      ))}
      {draft && <ShapeView shape={draft} viewport={viewport} outline />}
    </div>
  );
}

function ShapeView(props: {
  shape: Rect & ShapeStyle & Partial<Pick<ShapeItem, "borderWidth" | "borderStyle">>;
  viewport: Viewport;
  /** Draw only the outline in the shape's color, for the drag preview. */
  outline?: boolean;
}) {
  const { shape, viewport, outline = false } = props;
  const { x, y, width, height } = rectToScreen(shape, viewport);
  const strokeWidth = outline ? 2 : (shape.borderWidth ?? 0) * viewport.scale;
  // The stroke is centered on the path, so the path is inset to keep the whole shape inside its box.
  const inset = strokeWidth / 2;
  return (
    <svg
      data-shape={shape.type}
      className="absolute overflow-visible"
      style={{ left: x, top: y }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={shapePath(shape.type, Math.max(width - strokeWidth, 0), Math.max(height - strokeWidth, 0))}
        transform={`translate(${inset} ${inset})`}
        fill={outline ? "none" : shape.color}
        stroke={outline ? shape.color : strokeWidth > 0 ? "black" : "none"}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={dashArray(shape.borderStyle, strokeWidth)}
      />
    </svg>
  );
}

function dashArray(style: BorderStyle | undefined, strokeWidth: number) {
  if (style === "dashed") return `${strokeWidth * 3} ${strokeWidth * 2}`;
  // Zero-length dashes with round caps render as dots.
  if (style === "dotted") return `0 ${strokeWidth * 2}`;
  return undefined;
}
