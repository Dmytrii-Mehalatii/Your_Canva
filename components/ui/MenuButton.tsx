import type { ReactNode } from "react";
import Icon from "./Icon";

type Props = {
  label: string;
  open: boolean;
  onToggle: () => void;
  /** Trigger content, rendered in a 48px slot. */
  children: ReactNode;
  /** The popover, positioned relative to this control; rendered only while open. */
  menu: ReactNode;
  chevron?: boolean;
  className?: string;
};

/** A trigger that opens a popover below or above it. */
export default function MenuButton({ label, open, onToggle, children, menu, chevron = true, className = "" }: Props) {
  return (
    <div className={`relative flex h-full items-center ${className}`}>
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        onClick={onToggle}
        className="flex h-12 cursor-pointer items-center rounded-xl text-ink"
      >
        <span className="flex h-12 w-12 items-center justify-center">{children}</span>
        {chevron && <Icon name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"} className="-ml-2" />}
      </button>
      {open && menu}
    </div>
  );
}
