"use client";

import { ShapeStroke } from "../page";
import ShapesSettings from "./shapesSettings/page";

export default function AllShapes(props: {
  shapeStrokes: ShapeStroke[];
  className?: string;
  viewport?: { x: number; y: number; scale: number };
  shapeIndex: number | null;
  setShapeStrokes: (p: any) => void;
}) {
  return (
    <>
      {props.shapeStrokes.map((shape: ShapeStroke, index: number) => {
        const scale = props.viewport?.scale ?? 1;
        const left = shape.left * scale + (props.viewport?.x ?? 0);
        const top = shape.top * scale + (props.viewport?.y ?? 0);

        const width = shape.width * scale;
        const height = shape.height * scale;

        let radius = "";
        let rotate = "";
        if (shape.type == "circle") {
          radius = "100%";
        } else if (shape.type == "rhombus") {
          rotate = "45deg";
        }

        return (
          <div
            key={index}
            className={`${props.className}`}
          >
            {props.shapeIndex === index && (
              <ShapesSettings
                color={shape.color}
                shape={shape}
                shapeStrokes={props.shapeStrokes}
                setShapeStrokes={props.setShapeStrokes}
                index={index}
                setShapeColor={(newColor) =>
                  props.setShapeStrokes((prev: ShapeStroke[]) =>
                    prev.map((t: ShapeStroke, i: number) =>
                      i === index ? { ...t, color: newColor } : t
                    )
                  )
                }
              />
            )}
            <div
              style={{
                position: "absolute",
                background: shape.color,
                border: `${shape.borderWidth}px ${shape.borderStyle} black`,
                width: width,
                height: height,
                left: left,
                top: top,
                borderRadius: radius,
                rotate: rotate,
              }}
            ></div>
          </div>
        );
      })}
    </>
  );
}
