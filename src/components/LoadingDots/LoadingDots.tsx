import { type CSSProperties, forwardRef } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { loader } from "../../icons/loader.js";
import type { IconData } from "../../icons/types.js";
import type { Tone } from "../../tokens/schema.js";

export interface LoadingDotsTokens {
  dotSize: string;
  gap: string;
  color: string;
  duration: string;
  sizeSm: string;
  sizeMd: string;
  sizeLg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    loadingDots: LoadingDotsTokens;
  }
}

export interface LoadingDotsProps {
  /**
   * `dots` (default): three dots that pulse in sequence. `spinner`: the `loader` icon turning, icon-sized, for tight
   * places such as a gutter, a tree row or beside a button's text.
   */
  variant?: "dots" | "spinner";
  /** `inherit` follows the surrounding font size (use inside text and buttons); otherwise a fixed size. */
  size?: "inherit" | "sm" | "md" | "lg";
  /** Semantic colour. `inherit` uses the current text colour. */
  tone?: Tone | "inherit" | "muted";
  /** Any CSS colour; overrides `tone` for one-off cases. Prefer tones or tokens. */
  color?: string;
  /** Pulse or turn speed. Reduced motion always shows still dots or a still spinner. */
  speed?: "slow" | "normal" | "fast";
  /** Announces progress (`role="status"`) with this name. Omit when the surrounding control already reports it (e.g. Button `aria-busy`). */
  label?: string;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-loading-dots-* tokens. */
  style?: CSSProperties;
  /** Set on the root element, for tests. */
  "data-testid"?: string;
}

/** The loader icon without its hover motion: the spinner turns on its own, and a Button would add a second turn. */
const SPINNER: IconData = { name: loader.name, category: loader.category, body: loader.body };

/** Three dots that pulse in sequence, or a turning spinner: Cynosure's indicator for short, indeterminate waits. */
export const LoadingDots = forwardRef<HTMLSpanElement, LoadingDotsProps>(function LoadingDots(
  {
    variant = "dots",
    size = "inherit",
    tone = "inherit",
    color,
    speed = "normal",
    label,
    className,
    style,
    ...rest
  },
  ref,
) {
  return (
    <span
      ref={ref}
      {...rest}
      className={`cy-loading-dots${className ? ` ${className}` : ""}`}
      data-variant={variant}
      data-size={size}
      data-tone={tone}
      data-speed={speed}
      style={color ? ({ "--cy-loading-dots-color": color, ...style } as CSSProperties) : style}
      {...(label ? { role: "status", "aria-label": label } : { "aria-hidden": true })}
    >
      {variant === "spinner" ? (
        <Icon icon={SPINNER} className="cy-loading-dots-spinner" />
      ) : (
        <>
          <span className="cy-reset cy-loading-dots-dot" />
          <span className="cy-reset cy-loading-dots-dot" />
          <span className="cy-reset cy-loading-dots-dot" />
        </>
      )}
    </span>
  );
});
