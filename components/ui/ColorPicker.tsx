import { HexColorPicker } from "react-colorful";
import useEyeDropper from "use-eye-dropper";
import Dropdown, { type Placement } from "./Dropdown";
import IconButton from "./IconButton";

type Props = {
  color: string;
  onChange: (color: string) => void;
  placement?: Placement;
};

export default function ColorPicker({ color, onChange, placement }: Props) {
  const { open, isSupported } = useEyeDropper();

  const pickFromScreen = async () => {
    try {
      onChange((await open()).sRGBHex);
    } catch {
      // The user dismissed the eyedropper.
    }
  };

  return (
    <Dropdown placement={placement} className="color-picker h-56 w-[246px] gap-4 px-2.5 py-4">
      <HexColorPicker color={color} onChange={onChange} />
      <div className="flex gap-3">
        <div className="flex h-9 w-full items-center gap-3 rounded-lg border-2 border-blush px-4">
          <div className="h-5 w-5 rounded-full" style={{ background: color }} />
          <p>{color}</p>
        </div>
        {isSupported() && (
          <IconButton
            icon="colorize"
            label="Pick a color from the screen"
            size="md"
            iconSize={24}
            className="border-2 border-blush"
            onClick={pickFromScreen}
          />
        )}
      </div>
    </Dropdown>
  );
}
