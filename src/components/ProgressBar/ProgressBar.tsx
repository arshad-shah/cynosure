import { type CSSProperties, useId } from "react";
import type { Size, Tone } from "../../tokens/schema.js";

export interface ProgressBarTokens {
  heightSm: string;
  heightMd: string;
  heightLg: string;
  radius: string;
  track: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    progressBar: ProgressBarTokens;
  }
}

export interface ProgressBarLabels {
  /** Text for the current value, shown with `showValue` and read by screen readers. Default: "42%". */
  value: (value: number, max: number) => string;
}

export interface ProgressBarProps {
  /** Accessible name, shown above the bar unless `labelHidden`. */
  label: string;
  labelHidden?: boolean;
  /** Current value between 0 and `max`. Leave it out (or pass `indeterminate`) when progress is unknown. */
  value?: number | undefined;
  max?: number;
  /** Progress is happening but its amount is unknown. */
  indeterminate?: boolean;
  /** Show the value text at the end of the label row. */
  showValue?: boolean;
  tone?: Exclude<Tone, "neutral"> | "neutral";
  /** Bar thickness. */
  size?: Size;
  labels?: Partial<ProgressBarLabels>;
  className?: string;
  /** Layout only. Restyle through --cy-progress-bar-* tokens. */
  style?: CSSProperties;
}

const percent = (value: number, max: number) => `${Math.round((value / max) * 100)}%`;

/** How far a task has got: a labelled `role="progressbar"`, determinate or indeterminate. */
export function ProgressBar({
  label,
  labelHidden = false,
  value,
  max = 100,
  indeterminate = false,
  showValue = false,
  tone = "accent",
  size = "md",
  labels,
  className,
  style,
}: ProgressBarProps) {
  const id = useId();
  const top = max > 0 ? max : 100;
  const unknown = indeterminate || value === undefined || Number.isNaN(value);
  const now = unknown ? 0 : Math.min(Math.max(value, 0), top);
  const text = unknown ? "" : (labels?.value ?? percent)(now, top);
  return (
    <div
      className={className ? `cy-progress-bar ${className}` : "cy-progress-bar"}
      data-size={size}
      data-tone={tone}
      data-indeterminate={unknown || undefined}
      style={style}
    >
      {(!labelHidden || (showValue && !unknown)) && (
        <div className="cy-progress-bar-head cy-reset">
          {!labelHidden && (
            <span id={`${id}-label`} className="cy-progress-bar-label cy-reset">
              {label}
            </span>
          )}
          {showValue && !unknown && (
            <span className="cy-progress-bar-value cy-reset" aria-hidden="true">
              {text}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        className="cy-progress-bar-track cy-reset"
        {...(labelHidden ? { "aria-label": label } : { "aria-labelledby": `${id}-label` })}
        aria-valuemin={0}
        aria-valuemax={top}
        aria-valuenow={unknown ? undefined : now}
        aria-valuetext={unknown ? undefined : text}
        aria-busy={unknown || undefined}
        style={{ "--_fill": unknown ? undefined : `${(now / top) * 100}%` } as CSSProperties}
      >
        <div className="cy-progress-bar-fill cy-reset" />
      </div>
    </div>
  );
}
