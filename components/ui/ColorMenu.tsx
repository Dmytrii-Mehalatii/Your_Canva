import ColorPicker from "./ColorPicker";
import type { Placement } from "./Dropdown";
import MenuButton from "./MenuButton";

type Props = {
  label: string;
  color: string;
  open: boolean;
  onToggle: () => void;
  onChange: (color: string) => void;
  placement?: Placement;
  className?: string;
};

/** Round color swatch that opens a color picker. */
export default function ColorMenu({ label, color, open, onToggle, onChange, placement, className }: Props) {
  return (
    <MenuButton
      label={label}
      open={open}
      onToggle={onToggle}
      className={className}
      menu={<ColorPicker color={color} onChange={onChange} placement={placement} />}
    >
      <span className="h-7 w-7 rounded-full border border-gray-200" style={{ background: color }} />
    </MenuButton>
  );
}
