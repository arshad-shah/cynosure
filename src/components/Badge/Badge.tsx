import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";
import type { Size, Tone } from "../../tokens/schema.js";

export interface BadgeTokens {
  radius: string;
  tracking: string;
  softMix: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    badge: BadgeTokens;
  }
}

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  variant?: "soft" | "solid" | "outline";
  size?: Size;
  icon?: IconData | undefined;
  /**
   * A category colour (any CSS colour), for labels a product colours itself (HTTP methods, calendar categories). The
   * text is mixed toward the ink so it stays readable. Overrides `tone`.
   */
  color?: string | undefined;
  /** A dot before the text: `true` for a steady one, `"live"` for a pulsing one (recording, connected). */
  dot?: boolean | "live";
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Small status or category label in the mono "eyebrow" style. */
export function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  size = "md",
  icon,
  color,
  dot,
  className,
  style,
}: BadgeProps) {
  return (
    <span
      className={`cy-badge${className ? ` ${className}` : ""}`}
      data-tone={color ? undefined : tone}
      data-color={color ? "" : undefined}
      data-variant={variant}
      data-size={size}
      style={color ? ({ "--_tone": color, ...style } as CSSProperties) : style}
    >
      {dot && (
        <span
          className="cy-badge-dot cy-reset"
          data-live={dot === "live" ? "" : undefined}
          aria-hidden="true"
        />
      )}
      {icon && <Icon icon={icon} size="sm" />}
      {children}
    </span>
  );
}
