export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  penColor: string;
  width: number;
  tool: "pen" | "rubber" | "sticker" | "shape" | "other" | "text";
  points: Point[];
};

export type TextStroke = {
  color: string;
  font: string;
  fontSize: number;
  value: string;
  points: Point[];
};

export type ShapeStroke = {
  type: string;
  width: number;
  height: number;
  left: number;
  top: number;
  color: string;
  borderWidth: number;
  borderStyle: string;
  points: ShapeBorder[];
};

export type StickerStroke = {
  src: string;
  width: number;
  height: number;
  points: Point[];
  left: number;
  top: number;
};

export type ShapeBorder = {
  startPoint: Point[];
  endPoint: Point[];
};
