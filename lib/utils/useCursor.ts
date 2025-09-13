"use client";

import { useCallback, useEffect, useState } from "react";

export function useCursor() {
  const [xPosition, setXPosition] = useState<number | null>();
  const [yPosition, setYPosition] = useState<number | null>();
  const [isTracking, setIsTracking] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setXPosition(e.clientX);
    setYPosition(e.clientY);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsTracking(true);
    window.addEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const handleMouseUp = useCallback(() => {
    setIsTracking(false);
    window.removeEventListener("mousemove", handleMouseMove);
    setXPosition(null);
    setYPosition(null);
  }, [handleMouseMove]);

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove]);

  return { x: xPosition, y: yPosition, isTracking };
}
