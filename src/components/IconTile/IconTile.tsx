import { type CSSProperties, forwardRef } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";
import type { Size, Tone } from "../../tokens/schema.js";

export interface IconTileTokens {
  /** Width and height at `size="sm"` (the small control height). */
  sizeSm: string;
  /** Width and height at `size="md"` (the medium control height). */
  sizeMd: string;
  /** Width and height at `size="lg"` (the large control height). */
  sizeLg: string;
  /** Corner radius of the square shape. Default: the tile's size times the theme's radius factor. */
  radius: string;
  /** Tint strength of the soft variant (percentage of the tone mixed into the surface). */
  softMix: string;
  /** Size of the icon as a fraction of the tile, a number. Default 0.5. */
  iconScale: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    iconTile: IconTileTokens;
  }
}

export interface IconTileProps {
  /** The Facet icon drawn on the tile. */
  icon: IconData;
  /**
   * Accessible name. With it the tile is an image (`role="img"`) named by it; without it the tile is decorative and
   * hidden from assistive technology, for when text beside it says the same thing.
   */
  label?: string | undefined;
  /** Width and height: the control heights, so they scale with the theme. Default "md". */
  size?: Size;
  /** Semantic colour. Default "accent". */
  tone?: Tone;
  /** `soft` tinted fill, `solid` full tone fill, `outline` a tinted border on the surface. Default "soft". */
  variant?: "soft" | "solid" | "outline";
  /** Outline: a square with rounded corners, or a circle. Default "square". */
  shape?: "square" | "circle";
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-icon-tile-* tokens. */
  style?: CSSProperties;
}

/** A Facet icon on a tinted square or circle: a feature's mark, a stat's or a list item's icon. */
export const IconTile = forwardRef<HTMLSpanElement, IconTileProps>(function IconTile(
  { icon, label, size = "md", tone = "accent", variant = "soft", shape = "square", className, style },
  ref,
) {
  return (
    <span
      ref={ref}
      className={`cy-icon-tile${className ? ` ${className}` : ""}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      data-size={size}
      data-tone={tone}
      data-variant={variant}
      data-shape={shape}
      style={style}
    >
      <Icon icon={icon} />
    </span>
  );
});
