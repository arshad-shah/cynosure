import { type CSSProperties, createElement } from "react";
import type { IconData } from "../../icons/types.js";
import type { Tone } from "../../tokens/schema.js";

export interface IconProps {
  icon: IconData;
  /** Gives the icon `role="img"` and this accessible name. Omit for decorative icons. */
  label?: string;
  size?: "sm" | "md" | "lg" | number;
  /** Semantic colour. `inherit` (default) uses the current text colour. */
  tone?: Tone | "inherit" | "muted";
  /** Any CSS colour; overrides `tone` for one-off cases. */
  color?: string;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Foundation: renders a Facet icon as inline SVG (stroke only, currentColor). */
export function Icon({ icon, label, size = "md", tone = "inherit", color, className, style }: IconProps) {
  const sizing = typeof size === "number" ? ({ "--cy-icon-size": `${size}px` } as CSSProperties) : undefined;
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: named via aria-label when labelled, aria-hidden when decorative
    <svg
      className={className ? `cy-reset cy-icon ${className}` : "cy-reset cy-icon"}
      viewBox="0 0 24 24"
      data-size={typeof size === "number" ? undefined : size}
      data-motion={icon.motion}
      data-tone={tone === "inherit" ? undefined : tone}
      style={{ ...sizing, ...(color ? { color } : {}), ...style }}
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {icon.body.map(([tag, { animate, ...attrs }], i) =>
        createElement(tag, { key: i, ...attrs, className: animate ? "cy-icon-animate" : undefined }),
      )}
    </svg>
  );
}
