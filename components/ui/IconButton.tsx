import type { ReactElement } from "react";
import Icon, { type IconName } from "./Icon";

const SIZES = {
  xs: "size-6 shrink-0 rounded-lg",
  sm: "size-8 shrink-0 rounded-lg",
  md: "size-9 shrink-0 rounded-lg",
  lg: "size-12 shrink-0 rounded-xl",
  /** Shares the parent's row equally with its siblings and wraps with them on narrow screens. */
  fill: "h-10 min-w-0 flex-1 rounded-lg",
};

type Props = {
  /** A Material Symbols glyph by name, or a custom icon element. */
  icon: IconName | ReactElement;
  /** Accessible name; also shown as the tooltip. */
  label: string;
  onClick?: () => void;
  active?: boolean;
  size?: keyof typeof SIZES;
  /** Glyph size in pixels (named icons only). */
  iconSize?: number;
  className?: string;
  iconClassName?: string;
};

export default function IconButton({
  icon,
  label,
  onClick,
  active = false,
  size = "lg",
  iconSize = 40,
  className = "",
  iconClassName,
}: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-center ${SIZES[size]} ${active ? "text-brand" : "text-ink"} ${className}`}
    >
      {typeof icon === "string" ? <Icon name={icon} size={iconSize} className={iconClassName} /> : icon}
    </button>
  );
}
