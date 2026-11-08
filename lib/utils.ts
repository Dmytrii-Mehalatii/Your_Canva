export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function newId() {
  // randomUUID is only available in secure contexts; the dev server may be opened over plain http from another device.
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}
