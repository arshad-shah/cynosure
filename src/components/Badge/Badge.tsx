import { type CSSProperties, forwardRef, type ReactNode } from "react";
import type { RootAttributes } from "../../foundations/attributes.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { close } from "../../icons/index.js";
import type { IconData } from "../../icons/types.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";

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

interface BadgeBaseProps extends RootAttributes {
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
  /**
   * Makes the badge a removable chip (an active filter): a remove button at its end, named "Remove <text>", calls
   * this when pressed. Remove the badge in it and move focus to a sensible place (the next chip, or the field the
   * filters came from).
   */
  onRemove?: (() => void) | undefined;
  /** Replace the built-in English text: the remove button's name. */
  labels?: Partial<BadgeLabels> | undefined;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Badge's built-in text. */
export interface BadgeLabels {
  /** Name of the remove button. Default: "Remove <text>" when the badge's text is plain, else "Remove". */
  remove: string;
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
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    children,
    tone = "neutral",
    variant = "soft",
    size = "md",
    icon,
    color,
    dot,
    label,
    onRemove,
    labels,
    className,
    style,
    ...rest
  },
  ref,
) {
  // Without text it is a status dot: an image named by `label`, or decoration without one.
  const alone = children == null;
  return (
    <span
      ref={ref}
      {...rest}
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
      {onRemove && !alone && (
        <IconButton
          icon={close}
          label={
            labels?.remove ??
            (typeof children === "string" || typeof children === "number" ? `Remove ${children}` : "Remove")
          }
          size="xs"
          // On a solid badge the button is filled like it; otherwise it is ghost in the badge's text colour.
          variant={variant === "solid" ? "solid" : "ghost"}
          {...(color ? { color } : { tone })}
          wrapperClassName="cy-badge-remove"
          onClick={onRemove}
        />
      )}
    </span>
  );
});
