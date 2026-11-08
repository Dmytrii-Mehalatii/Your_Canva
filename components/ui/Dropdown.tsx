import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const PLACEMENT = {
  below: "top-full mt-3",
  above: "bottom-full mb-5",
};

export type Placement = keyof typeof PLACEMENT;

const VIEWPORT_MARGIN = 8;

/** Popover centered on its (relatively positioned) parent and nudged back inside the viewport when it would overflow. */
export default function Dropdown(props: { placement?: Placement; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Measure where the popover sits before any nudge, then nudge only as far as needed. The
    // document's client size is used rather than window.innerWidth, which mobile browsers stretch
    // to fit overflowing content (such as this very popover before it is nudged).
    const { clientWidth, clientHeight } = document.documentElement;
    const next = {
      x: overflowCorrection(rect.left - shift.x, rect.width, clientWidth),
      y: overflowCorrection(rect.top - shift.y, rect.height, clientHeight),
    };
    if (next.x !== shift.x || next.y !== shift.y) setShift(next);
  }, [shift]);

  return (
    <div
      ref={ref}
      className={`panel absolute left-1/2 z-50 flex flex-col ${PLACEMENT[props.placement ?? "below"]} ${props.className ?? ""}`}
      style={{ translate: `calc(-50% + ${shift.x}px) ${shift.y}px` }}
    >
      {props.children}
    </div>
  );
}

function overflowCorrection(start: number, length: number, viewport: number) {
  if (start < VIEWPORT_MARGIN) return VIEWPORT_MARGIN - start;
  const end = start + length;
  if (end > viewport - VIEWPORT_MARGIN) return viewport - VIEWPORT_MARGIN - end;
  return 0;
}
