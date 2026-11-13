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

interface BadgeBaseProps {
  /** Semantic colour. Default "neutral". */
  tone?: Tone;
  /** Fill style. Default "soft". */
  variant?: "soft" | "solid" | "outline";
  /** Size of the badge. Default "md". */
  size?: Size;
  /** Icon shown before the text. */
  icon?: IconData | undefined;
  /**
   * A category colour (any CSS colour), for labels a product colours itself (HTTP methods, calendar categories). The
   * text is mixed toward the ink so it stays readable. Overrides `tone`.
   */
  color?: string | undefined;
  /** A dot before the text: `true` for a steady one, `"live"` for a pulsing one (recording, connected). */
  dot?: boolean | "live";
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

export type BadgeProps = BadgeBaseProps &
  (
    | {
        /** The badge's text. Leave it out, with `dot`, for a status dot alone. */
        children: ReactNode;
        /** Accessible name of a dot without text; a badge with text is named by its text. */
        label?: undefined;
      }
    | {
        /** The badge's text. Leave it out, with `dot`, for a status dot alone. */
        children?: undefined;
        /**
         * Accessible name of a dot without text, saying the state ("Connected"): colour alone says nothing. Leave it
         * out only where text beside the dot already says the state: the dot is then decoration, hidden from assistive
         * technology.
         */
        label?: string | undefined;
      }
  );

/** Small status or category label in the mono "eyebrow" style; without text, a status dot. */
export function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  size = "md",
  icon,
  color,
  dot,
  label,
  className,
  style,
}: BadgeProps) {
  // Without text it is a status dot: an image named by `label`, or decoration without one.
  const alone = children == null;
  return (
    <span
      className={`cy-badge${className ? ` ${className}` : ""}`}
      {...(alone ? (label ? { role: "img", "aria-label": label } : { "aria-hidden": true }) : {})}
      data-dot-only={alone ? "" : undefined}
      data-tone={color ? undefined : tone}
      data-color={color ? "" : undefined}
      data-variant={variant}
      data-size={size}
      style={color ? ({ "--_tone": color, ...style } as CSSProperties) : style}
    >
      {(dot || alone) && (
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
