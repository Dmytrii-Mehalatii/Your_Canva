import { useState } from "react";

/** Tracks which of a set of mutually exclusive menus is open. */
export function useMenu<M extends string>() {
  const [open, setOpen] = useState<M | null>(null);
  const toggle = (menu: M) => setOpen((current) => (current === menu ? null : menu));
  const close = () => setOpen(null);
  return { open, toggle, close };
}
