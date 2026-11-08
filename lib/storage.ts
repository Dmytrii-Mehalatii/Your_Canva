/* The only places the app touches localStorage. Both swallow errors: storage can be disabled or full, and the board still works for the session. */

export function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing to do; the in-memory state is still correct.
  }
}
