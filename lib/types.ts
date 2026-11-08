export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Rect = Point & Size;

/** Pan offset in screen pixels plus the zoom factor applied to board coordinates. */
export type Viewport = { x: number; y: number; scale: number };

export type Tool = "select" | "pen" | "eraser" | "text" | "sticker" | "shape";

export type ShapeType = "square" | "circle" | "rhombus" | "triangle" | "hexagon" | "star" | "arrow" | "heart";
export type BorderStyle = "solid" | "dashed" | "dotted";

/** A catalog sticker: the image and the size it is placed at. */
export type Sticker = Size & { name: string; src: string };

/**
 * Strokes and shapes share one paint order, so an eraser stroke only cuts through what was
 * drawn before it. Items saved before this field existed have none and paint first.
 */
type Ordered = { order?: number };

export type Stroke = Ordered & {
  id: string;
  tool: "pen" | "eraser";
  color: string;
  width: number;
  points: Point[];
};

export type TextItem = Point & {
  id: string;
  value: string;
  color: string;
  /** Name of an entry in FONT_OPTIONS; resolved to a font-family when rendering. */
  font: string;
  fontSize: number;
};
export type TextStyle = Pick<TextItem, "color" | "font" | "fontSize">;

export type ShapeItem = Rect &
  Ordered & {
  id: string;
  type: ShapeType;
  color: string;
  borderWidth: number;
  borderStyle: BorderStyle;
};
export type ShapeStyle = Pick<ShapeItem, "type" | "color">;

/** A sticker image at a position on the board, before it is given an id. */
export type PlacedSticker = Rect & { src: string };
export type StickerItem = PlacedSticker & { id: string };

export type Selection = { kind: "text" | "shape" | "sticker"; id: string } | null;

export type ToolSettings = {
  brushSize: number;
  penColor: string;
  /** Style applied to newly drawn shapes. */
  shape: ShapeStyle;
  /** Style applied to newly created text boxes. */
  text: TextStyle;
  sticker: Sticker | null;
};
