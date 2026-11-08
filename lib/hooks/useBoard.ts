import { useState } from "react";
import { contains } from "../board/geometry";
import { shapeContains } from "../board/shapes";
import { importLegacyShapes, importLegacyStickers, importLegacyStrokes, importLegacyTexts } from "../board/legacy";
import type { Point, Selection, ShapeItem, StickerItem, Stroke, TextItem } from "../types";
import { usePersistedList } from "./usePersistedList";

function useCollection<T extends { id: string }>(storageKey: string, seed: () => T[] | undefined) {
  const [items, setItems] = usePersistedList<T>(storageKey, seed);

  const add = (item: T) => setItems((prev) => [...prev, item]);
  const update = (id: string, patch: Partial<T>) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const remove = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));
  const clear = () => setItems([]);

  return { items, add, update, remove, clear };
}

type SelectedItem =
  | { kind: "text"; item: TextItem }
  | { kind: "shape"; item: ShapeItem }
  | { kind: "sticker"; item: StickerItem };

/** Everything drawn on the board, persisted per collection, plus the current selection. */
export function useBoard() {
  const strokes = useCollection<Stroke>("whiteboard:strokes", importLegacyStrokes);
  const texts = useCollection<TextItem>("whiteboard:texts", importLegacyTexts);
  const shapes = useCollection<ShapeItem>("whiteboard:shapes", importLegacyShapes);
  const stickers = useCollection<StickerItem>("whiteboard:stickers", importLegacyStickers);
  const [selection, select] = useState<Selection>(null);

  const selectable = { text: texts, shape: shapes, sticker: stickers };

  const selected = ((): SelectedItem | null => {
    if (!selection) return null;
    const item = selectable[selection.kind].items.find((candidate) => candidate.id === selection.id);
    // TypeScript cannot tie `kind` to the matching item type across the union; the map above does.
    return item ? ({ kind: selection.kind, item } as SelectedItem) : null;
  })();

  /** The topmost selectable item under a board point; stickers are drawn above shapes. */
  const itemAt = (point: Point): Selection => {
    const sticker = stickers.items.findLast((item) => contains(item, point));
    if (sticker) return { kind: "sticker", id: sticker.id };
    const shape = shapes.items.findLast((item) => shapeContains(item, point));
    return shape ? { kind: "shape", id: shape.id } : null;
  };

  const deleteSelected = () => {
    if (!selection) return;
    selectable[selection.kind].remove(selection.id);
    select(null);
  };

  const clearAll = () => {
    for (const collection of [strokes, ...Object.values(selectable)]) collection.clear();
    select(null);
  };

  return { strokes, texts, shapes, stickers, selected, select, itemAt, deleteSelected, clearAll };
}

export type Board = ReturnType<typeof useBoard>;
