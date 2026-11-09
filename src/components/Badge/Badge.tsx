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
  className,
  style,
}: BadgeProps) {
  return (
    <span
      className={`cy-badge${className ? ` ${className}` : ""}`}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      style={style}
    >
      {icon && <Icon icon={icon} size="sm" />}
      {children}
    </span>
  );
}
