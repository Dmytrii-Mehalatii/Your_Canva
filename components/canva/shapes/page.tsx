export default function AllShapes(props: {
  shapeStrokes: any;
  viewport?: { x: number; y: number; scale: number };
}) {
  console.log("done");
  return (
    <>
      {props.shapeStrokes.map((shape: any, index: number) => {
        const scale = props.viewport?.scale ?? 1;
        const left = shape.left * scale + (props.viewport?.x ?? 0);
        const top = shape.top * scale + (props.viewport?.y ?? 0);

        const width = shape.width * scale;
        const height = shape.height * scale;
        return (
          <div key={index}>
            <div
              className="absolute"
              style={{
                background: shape.color,
                width: width,
                height: height,
                left: left,
                top: top,
              }}
            ></div>
          </div>
        );
      })}
    </>
  );
}
