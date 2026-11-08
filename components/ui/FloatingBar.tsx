import type { ReactNode } from "react";

export const BAR_POSITION = {
  /** Settings bars for the selected item; a layer above the toolbars so their popovers win on short screens. */
  top: "top-10 z-40",
  /** Secondary toolbars, just above the main toolbar. */
  bottom: "bottom-[132px] z-30",
};

/**
 * Horizontally centered bar sized to its content; on narrow screens it caps at the viewport and
 * its controls wrap. `w-max` rather than `w-fit`: an absolutely positioned box at `left: 50%`
 * only gets half the viewport as available width, which would wrap it far too early.
 */
export default function FloatingBar(props: {
  position: keyof typeof BAR_POSITION;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`panel absolute left-1/2 flex min-h-12 w-max max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap items-center ${BAR_POSITION[props.position]} ${props.className ?? ""}`}
    >
      {props.children}
    </div>
  );
}
