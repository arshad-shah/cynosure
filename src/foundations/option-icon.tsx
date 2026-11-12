import type { IconData } from "../icons/types.js";
import { Icon, type IconProps } from "./Icon/Icon.js";

/**
 * The colour of an option's icon, with the names and meaning of Icon's own `tone` and `color`. Shared by every
 * component that lists options with icons: Select, Combobox, Menu and ContextMenu.
 */
export interface OptionIconColor {
  /** Semantic colour of `icon`, as Icon's `tone`. Default: the icon's usual colour in that list. */
  iconTone?: IconProps["tone"];
  /**
   * Any CSS colour for `icon`, as Icon's `color`: it overrides `iconTone`, and `brand` draws a brand mark in its
   * owner's colour. Prefer `iconTone`; with your own colour, check it is readable in light and dark.
   */
  iconColor?: string;
}

/**
 * Internal: an option's icon in its own colour. `plain` (a disabled option, a disabled control) leaves the colour
 * off, so the icon is muted with the rest of the row.
 */
export function OptionIcon({
  option,
  plain,
  className,
  size,
}: {
  option: OptionIconColor & { icon?: IconData | undefined };
  plain?: boolean | undefined;
  className: string;
  /** Icon's size; default Icon's own ("md"). A dense (`xs`) Select trigger passes "sm". */
  size?: IconProps["size"] | undefined;
}) {
  if (!option.icon) return null;
  const props: IconProps = { icon: option.icon, className };
  if (size) props.size = size;
  if (!plain && option.iconTone) props.tone = option.iconTone;
  if (!plain && option.iconColor) props.color = option.iconColor;
  return <Icon {...props} />;
}
