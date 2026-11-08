import { useEffect, useLayoutEffect, useRef } from "react";
import { pointToScreen } from "@/lib/board/geometry";
import { measureTextWidth } from "@/lib/board/text";
import { fontFamilyOf } from "@/lib/fonts";
import type { TextItem, Viewport } from "@/lib/types";

const LINE_HEIGHT = 1.5;
const MAX_LINES = 24;

type Props = {
  texts: TextItem[];
  viewport: Viewport;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<TextItem>) => void;
};

export default function TextLayer({ texts, viewport, selectedId, onSelect, onChange }: Props) {
  return texts.map((text) => (
    <TextBox
      key={text.id}
      text={text}
      viewport={viewport}
      selected={text.id === selectedId}
      onSelect={() => onSelect(text.id)}
      onChange={(patch) => onChange(text.id, patch)}
    />
  ));
}

function TextBox(props: {
  text: TextItem;
  viewport: Viewport;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<TextItem>) => void;
}) {
  const { text, viewport, selected, onSelect, onChange } = props;
  const ref = useRef<HTMLTextAreaElement>(null);
  const { scale } = viewport;
  const position = pointToScreen(text, viewport);
  const fontFamily = fontFamilyOf(text.font);
  const fontSize = text.fontSize * scale;

  // The box hugs its content: width follows the longest line, height follows the line count (capped).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const font = `${fontSize}px ${fontFamily}`;
    let stale = false;
    const fit = () => {
      if (stale) return;
      el.style.width = `${measureTextWidth(text.value || el.placeholder, font) + 12 * scale}px`;
      el.style.height = "0";
      el.style.height = `${Math.min(el.scrollHeight, MAX_LINES * LINE_HEIGHT * fontSize)}px`;
    };
    fit();
    // Web fonts load lazily, so the first fit may have measured the fallback face.
    if (!document.fonts.check(font)) document.fonts.load(font).then(fit, () => undefined);
    return () => {
      stale = true;
    };
  }, [text.value, fontFamily, fontSize, scale]);

  // Keyboard focus follows the board selection: a box created with the text tool is focused once it
  // mounts, and a box deselected by a canvas press stops taking keystrokes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (selected) el.focus();
    else if (document.activeElement === el) el.blur();
  }, [selected]);

  return (
    <textarea
      ref={ref}
      value={text.value}
      placeholder="Add text"
      rows={1}
      className="absolute z-20 resize-none overflow-hidden break-words outline-none focus:outline-2 focus:outline-red-500"
      style={{
        left: position.x,
        top: position.y,
        color: text.color,
        fontFamily,
        fontSize,
        lineHeight: LINE_HEIGHT,
        padding: `${6 * scale}px ${4 * scale}px ${2 * scale}px`,
        minWidth: 50 * scale,
        maxWidth: 800 * scale,
      }}
      onChange={(e) => onChange({ value: e.target.value })}
      onFocus={onSelect}
      onBlur={(e) => {
        const value = e.target.value.trim();
        if (value !== text.value) onChange({ value });
      }}
    />
  );
}
