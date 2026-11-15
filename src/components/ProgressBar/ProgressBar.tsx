import { type CSSProperties, useId } from "react";
import type { DenseSize, Tone } from "../../tokens/schema.js";

export interface ProgressBarTokens {
  stepGap: string;
  heightXs: string;
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

export interface ProgressSegment {
  value: number;
  /** Read out with the value ("Connect 30"). */
  label: string;
  tone?: Exclude<Tone, "neutral"> | "neutral";
  /** A category colour (any CSS colour); overrides `tone`. */
  color?: string;
}

export interface ProgressBarProps {
  /** Accessible name, shown above the bar unless `labelHidden`. */
  label: string;
  /** Visually hide the label (it still names the bar). */
  labelHidden?: boolean;
  /** Current value between 0 and `max`. Leave it out (or pass `indeterminate`) when progress is unknown. */
  value?: number | undefined;
  /** The value that means complete. Default 100. */
  max?: number;
  /** Progress is happening but its amount is unknown. */
  indeterminate?: boolean;
  /** Show the value text at the end of the label row. */
  showValue?: boolean;
  /**
   * Parts drawn end to end instead of one fill, from `offset`: a request's timing (DNS, connect, wait, download) or a
   * waterfall row. Each has a `label` (read out) and a `tone` or category `color`.
   */
  segments?: ProgressSegment[] | undefined;
  /** Where the first segment starts, in the same units as `max`. Default 0. */
  offset?: number;
  /** A thin mark across the track at this value (a target, a second position). */
  marker?: number | undefined;
  /** Read with the value when there is a marker. Default "marker at 75%". */
  markerLabel?: string | undefined;
  /**
   * A measurement, not a task's progress (password strength, entropy, a quota): `role="meter"` instead of
   * `"progressbar"`. A meter always has a value: it is never indeterminate, and a missing value reads 0. Default false.
   */
  meter?: boolean;
  /**
   * What the value means, in words ("Strong", "62 bits", "Step 2 of 5"): shown with `showValue` and read out instead
   * of the percentage. Ignored with `segments`, which read out their own labels.
   */
  valueText?: string | undefined;
  /**
   * Draw the track as this many separate pills, lit up to round(value / max × steps) in the tone: a stepped gauge
   * (four steps of password strength) or "step 2 of 5". Ignored with `segments` and while indeterminate.
   */
  steps?: number | undefined;
  /** Colour of the fill. Default "accent". */
  tone?: Exclude<Tone, "neutral"> | "neutral";
  /** Bar thickness. `xs` is a hairline track with smaller label text, for dense desktop chrome. Default "md". */
  size?: DenseSize;
  /** Replace the built-in English text: the value text. */
  labels?: Partial<ProgressBarLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-progress-bar-* tokens. */
  style?: CSSProperties;
}

const percent = (value: number, max: number) => `${Math.round((value / max) * 100)}%`;

/**
 * How far a task has got: a labelled `role="progressbar"`, determinate or indeterminate. With `meter`, a measurement
 * (`role="meter"`); with `steps`, a row of pills.
 */
export function ProgressBar({
  label,
  labelHidden = false,
  value,
  max = 100,
  indeterminate = false,
  showValue = false,
  segments,
  offset = 0,
  marker,
  markerLabel,
  meter = false,
  valueText,
  steps,
  tone = "accent",
  size = "md",
  labels,
  className,
  style,
}: ProgressBarProps) {
  const id = useId();
  const top = max > 0 ? max : 100;
  // A meter always has a value; a missing one reads 0.
  const unknown = !meter && (indeterminate || value === undefined || Number.isNaN(value));
  const now = unknown || value === undefined || Number.isNaN(value) ? 0 : Math.min(Math.max(value, 0), top);
  const parts = segments?.length ? segments : null;
  const total = parts ? offset + parts.reduce((sum, p) => sum + Math.max(0, p.value), 0) : 0;
  const unknownBar = parts ? false : unknown;
  const shownNow = parts ? Math.min(total, top) : now;
  const at = (v: number) => `${(Math.min(Math.max(v, 0), top) / top) * 100}%`;
  const pills = !parts && !unknownBar && steps && steps > 0 ? Math.floor(steps) : 0;
  const litPills = Math.round((now / top) * pills);
  const text = parts
    ? parts.map((p) => `${p.label} ${p.value}`).join(", ")
    : unknown
      ? ""
      : (valueText ?? (labels?.value ?? percent)(now, top));
  const spoken =
    marker === undefined
      ? text
      : [text, markerLabel ?? `marker at ${percent(marker, top)}`].filter(Boolean).join(", ");
  return (
    <div
      className={className ? `cy-progress-bar ${className}` : "cy-progress-bar"}
      data-size={size}
      data-tone={tone}
      data-indeterminate={unknownBar || undefined}
      style={style}
    >
      {(!labelHidden || (showValue && !unknown)) && (
        <div className="cy-progress-bar-head cy-reset">
          {!labelHidden && (
            <span id={`${id}-label`} className="cy-progress-bar-label cy-reset">
              {label}
            </span>
          )}
          {showValue && !unknownBar && (
            <span className="cy-progress-bar-value cy-reset" aria-hidden="true">
              {text}
            </span>
          )}
        </div>
      )}
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: both roles, progressbar and meter, take the value attributes */}
      <div
        role={meter ? "meter" : "progressbar"}
        className="cy-progress-bar-track cy-reset"
        data-steps={pills || undefined}
        {...(labelHidden ? { "aria-label": label } : { "aria-labelledby": `${id}-label` })}
        aria-valuemin={0}
        aria-valuemax={top}
        aria-valuenow={unknownBar ? undefined : shownNow}
        aria-valuetext={unknownBar ? undefined : spoken}
        aria-busy={unknownBar || undefined}
        style={
          { "--_fill": unknownBar || parts || pills ? undefined : `${(now / top) * 100}%` } as CSSProperties
        }
      >
        {parts ? (
          parts.map((p, i) => {
            const start = offset + parts.slice(0, i).reduce((sum, q) => sum + Math.max(0, q.value), 0);
            return (
              <div
                key={`${p.label}-${i}`}
                className="cy-progress-bar-segment cy-reset"
                data-tone={p.color ? undefined : (p.tone ?? tone)}
                style={
                  {
                    "--_from": at(start),
                    "--_to": at(start + Math.max(0, p.value)),
                    ...(p.color ? { "--_seg": p.color } : {}),
                  } as CSSProperties
                }
              />
            );
          })
        ) : pills ? (
          Array.from({ length: pills }, (_, i) => (
            <div key={i} className="cy-progress-bar-step cy-reset" data-on={i < litPills || undefined} />
          ))
        ) : (
          <div className="cy-progress-bar-fill cy-reset" />
        )}
        {marker !== undefined && (
          <div className="cy-progress-bar-marker cy-reset" style={{ "--_at": at(marker) } as CSSProperties} />
        )}
      </div>
    </div>
  );
}
