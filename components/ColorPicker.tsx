import { useColor } from "@/lib/utils/useColorContext";
import { useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import useEyeDropper from "use-eye-dropper";
import IconButton from "./IconButton";

export default function ColorPicker(props: {
  type: "stroke" | "text";
  bottom?: number;
  width: number | null;
  translate?: string;
  marginBottom?: number;
  onChangeColor?: (p: string) => void;
}) {
  const { penColor, setPenColor, textColor, setTextColor } = useColor();
  const { open, isSupported } = useEyeDropper();

  const color = props.type === "stroke" ? penColor : textColor;
  const setColor = props.type === "stroke" ? setPenColor : setTextColor;

  const pickColor = useCallback(() => {
    const openPicker = async () => {
      try {
        const color = await open();
        setColor(color.sRGBHex);
        props.onChangeColor?.(color.sRGBHex);
      } catch (e: any) {
        if (!e.canceled) return;
      }
    };
    openPicker();
  }, [open, setColor, props.onChangeColor]);

  return (
    <div
      style={{
        width: `${props.width}`,
      }}
    >
      <div
        className="color-picker-container"
        style={{
          bottom: `${props.bottom}px`,
          translate: `-${props.translate}%`,
          marginBottom: `${props.marginBottom}px`,
          zIndex: "101",
        }}
      >
        <HexColorPicker
          color={color}
          onChange={(newColor) => {
            setColor(newColor);
            props.onChangeColor?.(newColor);
          }}
        />
        <div className="flex flex-row gap-3">
          <div className="flex flex-row items-center text-center gap-3 px-4 h-9 w-full border-2 border-[#FFC0C4] rounded-lg">
            <div
              className="w-5 h-5 rounded-full"
              style={{ background: color }}
            ></div>
            <p>{color}</p>
          </div>

          {isSupported() ? (
            <div
              onClick={pickColor}
              className="border-2 border-[#FFC0C4] min-w-9 h-full rounded-lg"
            >
              <IconButton
                icon="colorize"
                size={6}
                color="#1C1B1F"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
