let measurer: CanvasRenderingContext2D | null = null;

/** Width of the widest line of `text` in CSS pixels, for the given CSS `font` shorthand. */
export function measureTextWidth(text: string, font: string) {
  measurer ??= document.createElement("canvas").getContext("2d");
  if (!measurer) return 0;
  const ctx = measurer;
  ctx.font = font;
  return Math.max(...text.split("\n").map((line) => ctx.measureText(line).width));
}
