import { Chilanka, Crafty_Girls, Judson } from "next/font/google";

const judson = Judson({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  preload: false,
});
const chilanka = Chilanka({ weight: "400", subsets: ["latin"], preload: false });
const craftyGirls = Crafty_Girls({ weight: "400", subsets: ["latin"], preload: false });

/**
 * Fonts offered in the text settings. Text items persist the `name`, not the
 * family, because next/font family names contain a hash that changes between builds.
 */
export const FONT_OPTIONS = [
  { name: "Default", family: "ui-sans-serif, system-ui, sans-serif" },
  { name: "Judson", family: judson.style.fontFamily },
  { name: "Chilanka", family: chilanka.style.fontFamily },
  { name: "Crafty Girls", family: craftyGirls.style.fontFamily },
];

export const DEFAULT_FONT = FONT_OPTIONS[0].name;

/** The option with that name, or the default when the name is unknown. */
export function findFont(name: string) {
  return FONT_OPTIONS.find((font) => font.name === name) ?? FONT_OPTIONS[0];
}

export function fontFamilyOf(name: string) {
  return findFont(name).family;
}
