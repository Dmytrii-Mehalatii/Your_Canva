"use client";

import { useCallback, useEffect, useState } from "react";

export function useCursor() {
  const [xTrackedPosition, setTrackedXPosition] = useState<number | null>();
  const [yTrackedPosition, setTrackedYPosition] = useState<number | null>();

  const [basicX, setBasicX] = useState<number | null>(null);
  const [basicY, setBasicY] = useState<number | null>(null);

  const [isTracking, setIsTracking] = useState(false);

  const handleMouseMoveWhileTracking = useCallback((e: MouseEvent) => {
    setTrackedXPosition(e.clientX);
    setTrackedYPosition(e.clientY);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setBasicX(e.clientX);
    setBasicY(e.clientY);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsTracking(true);
    window.addEventListener("mousemove", handleMouseMoveWhileTracking);
  }, [handleMouseMoveWhileTracking]);

  const handleMouseUp = useCallback(() => {
    setIsTracking(false);
    window.removeEventListener("mousemove", handleMouseMoveWhileTracking);
    setTrackedXPosition(null);
    setTrackedYPosition(null);
  }, [handleMouseMoveWhileTracking]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMoveWhileTracking);

      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseMoveWhileTracking,
  ]);

  return {
    x: xTrackedPosition,
    y: yTrackedPosition,
    basicX: basicX,
    basicY: basicY,
    isTracking,
  };
}
