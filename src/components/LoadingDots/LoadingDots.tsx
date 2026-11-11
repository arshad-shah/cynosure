import { type CSSProperties, forwardRef } from "react";
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
  /** `inherit` follows the surrounding font size (use inside text and buttons); otherwise a fixed size. */
  size?: "inherit" | "sm" | "md" | "lg";
  /** Semantic colour. `inherit` uses the current text colour. */
  tone?: Tone | "inherit" | "muted";
  /** Any CSS colour; overrides `tone` for one-off cases. Prefer tones or tokens. */
  color?: string;
  /** Pulse speed. Reduced motion always shows static dots. */
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

/** Three dots that pulse in sequence: Cynosure's indicator for short, indeterminate waits. */
export const LoadingDots = forwardRef<HTMLSpanElement, LoadingDotsProps>(function LoadingDots(
  { size = "inherit", tone = "inherit", color, speed = "normal", label, className, style, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      {...rest}
      className={`cy-loading-dots${className ? ` ${className}` : ""}`}
      data-size={size}
      data-tone={tone}
      data-speed={speed}
      style={color ? ({ "--cy-loading-dots-color": color, ...style } as CSSProperties) : style}
      {...(label ? { role: "status", "aria-label": label } : { "aria-hidden": true })}
    >
      <span className="cy-reset cy-loading-dots-dot" />
      <span className="cy-reset cy-loading-dots-dot" />
      <span className="cy-reset cy-loading-dots-dot" />
    </span>
  );
});
