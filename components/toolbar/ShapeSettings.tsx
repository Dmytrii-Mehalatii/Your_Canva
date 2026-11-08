import ColorMenu from "@/components/ui/ColorMenu";
import Divider from "@/components/ui/Divider";
import Dropdown from "@/components/ui/Dropdown";
import FloatingBar from "@/components/ui/FloatingBar";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import MenuButton from "@/components/ui/MenuButton";
import { BORDER_STYLES, BORDER_WIDTHS } from "@/lib/constants";
import { useMenu } from "@/lib/hooks/useMenu";
import type { ShapeItem } from "@/lib/types";

type Props = {
  shape: ShapeItem;
  onChange: (patch: Partial<ShapeItem>) => void;
  onDelete: () => void;
};

const OPTION_MENU = "w-40 items-center gap-5 px-4 py-6 text-xl";

export default function ShapeSettings({ shape, onChange, onDelete }: Props) {
  const menu = useMenu<"color" | "width" | "style">();
  const pick = (patch: Partial<ShapeItem>) => {
    onChange(patch);
    menu.close();
  };

  return (
    <FloatingBar position="top" className="gap-2 px-4">
      <ColorMenu
        label="Shape color"
        color={shape.color}
        open={menu.open === "color"}
        onToggle={() => menu.toggle("color")}
        onChange={(color) => onChange({ color })}
        className="w-20 justify-center"
      />

      <Divider />

      <MenuButton
        label="Border width"
        open={menu.open === "width"}
        onToggle={() => menu.toggle("width")}
        menu={
          <Dropdown className={OPTION_MENU}>
            {BORDER_WIDTHS.map((width) =>
              width === 0 ? (
                <button key={width} type="button" className="w-full cursor-pointer text-center" onClick={() => pick({ borderWidth: 0 })}>
                  none
                </button>
              ) : (
                <button
                  key={width}
                  type="button"
                  aria-label={`Border width ${width}`}
                  className="w-full cursor-pointer bg-black"
                  style={{ height: width }}
                  onClick={() => pick({ borderWidth: width })}
                />
              ),
            )}
          </Dropdown>
        }
      >
        <Icon name="line_weight" size={38} />
      </MenuButton>

      <MenuButton
        label="Border style"
        open={menu.open === "style"}
        onToggle={() => menu.toggle("style")}
        menu={
          <Dropdown className={OPTION_MENU}>
            {BORDER_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                aria-label={`${style} border`}
                className="w-full cursor-pointer border-t-8 border-black"
                style={{ borderTopStyle: style }}
                onClick={() => pick({ borderStyle: style })}
              />
            ))}
          </Dropdown>
        }
      >
        <Icon name="line_style" size={38} />
      </MenuButton>

      <Divider className="ml-1" />
      <IconButton icon="delete" label="Delete shape" iconSize={38} className="ml-1" onClick={onDelete} />
    </FloatingBar>
  );
}
