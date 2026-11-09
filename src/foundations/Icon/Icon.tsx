import { type CSSProperties, createElement } from "react";
import type { IconData } from "../../icons/types.js";

export interface IconProps {
  icon: IconData;
  /** Gives the icon `role="img"` and this accessible name. Omit for decorative icons. */
  label?: string;
  size?: "sm" | "md" | "lg" | number;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Foundation: renders a Facet icon as inline SVG. The star takes `--cy-icon-star` (default: the accent). */
export function Icon({ icon, label, size = "md", className, style }: IconProps) {
  const sizing = typeof size === "number" ? ({ "--cy-icon-size": `${size}px` } as CSSProperties) : undefined;
  const star = icon.star;
  const starSize = star?.size ?? 3;
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: named via aria-label when labelled, aria-hidden when decorative
    <svg
      className={className ? `cy-reset cy-icon ${className}` : "cy-reset cy-icon"}
      viewBox="0 0 24 24"
      data-size={typeof size === "number" ? undefined : size}
      data-motion={icon.motion}
      style={{ ...sizing, ...style }}
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {icon.body.map(([tag, { animate, ...attrs }], i) =>
        // biome-ignore lint/suspicious/noArrayIndexKey: icon parts are static and ordered
        createElement(tag, { key: i, ...attrs, className: animate ? "cy-icon-animate" : undefined }),
      )}
      {star && (
        <rect className="cy-icon-star" x={star.x} y={star.y} width={starSize} height={starSize} rx={0.8} />
      )}
    </svg>
  );
}
