import { useEffect, useRef, useState } from "react";

/** Loads each `src` once and returns the decoded images; the map identity changes as images arrive so dependents repaint. */
export function useImages(srcs: string[]) {
  const [images, setImages] = useState<ReadonlyMap<string, HTMLImageElement>>(new Map());
  const requested = useRef(new Set<string>());

  useEffect(() => {
    for (const src of srcs) {
      if (requested.current.has(src)) continue;
      requested.current.add(src);
      const image = new Image();
      image.onload = () => setImages((prev) => new Map(prev).set(src, image));
      image.src = src;
    }
  }, [srcs]);

  return images;
}
