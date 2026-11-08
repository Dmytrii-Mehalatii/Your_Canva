import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import { readJson, writeJson } from "../storage";

/**
 * `useState` for a list mirrored to localStorage. Storage is read in an effect so the server and
 * first client render agree (no hydration mismatch), and only changes made through the returned
 * setter are written back. `seed` supplies the initial list when the key holds nothing yet.
 */
export function usePersistedList<T>(key: string, seed?: () => T[] | undefined) {
  const [items, setItems] = useState<T[]>([]);
  const touched = useRef(false);
  const seedRef = useRef(seed);

  useEffect(() => {
    const saved = readJson(key);
    if (Array.isArray(saved)) {
      setItems(saved);
      return;
    }
    const seeded = seedRef.current?.();
    if (!seeded) return;
    writeJson(key, seeded);
    setItems(seeded);
  }, [key]);

  useEffect(() => {
    if (touched.current) writeJson(key, items);
  }, [key, items]);

  const set = useCallback((action: SetStateAction<T[]>) => {
    touched.current = true;
    setItems(action);
  }, []);

  return [items, set] as const;
}
