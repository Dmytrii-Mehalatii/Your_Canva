"use client";

import { useCursor } from "@/lib/utils/useCursor";

export default function Cursor(props: { size: number; draw: boolean }) {
  const position = useCursor();

  const styles = props.draw
    ? "pointer-events-none fixed z-1 rounded-full border-gray-900 border-1 opacity-80"
    : "border-gray-900 absolute";
  return (
    <div
      className={styles}
      style={{
        left: position.basicX! - props.size / 2,
        top: position.basicY! - props.size / 2,
        width: props.size,
        height: props.size,
      }}
    />
  );
}
