import { type CSSProperties, type KeyboardEvent, type PointerEvent, useState } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { stepKey } from "../../foundations/keys.js";
import { star } from "../../icons/star.js";

export interface RatingTokens {
  /** Space between the stars. */
  gap: string;
  /** Colour of the filled part of a star (any CSS colour; the `color` prop sets it for one rating). */
  filled: string;
  /** Colour of an empty star's outline. */
  empty: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    rating: RatingTokens;
  }
}

export interface RatingLabels {
  /** The value in words, read by screen readers and used in the read-only name. Default "4.3 out of 5". */
  value: (value: number, max: number) => string;
  /** The read-only rating's name. Default "Rated 4.3 out of 5". */
  rated: (value: number, max: number) => string;
}

export interface RatingProps {
  /** Names an interactive rating (the slider). A read-only one is named by `labels.rated`. Default "Rating". */
  label?: string;
  /** The rating, from 0 to `max`, when you control it. Read-only ratings draw any value exactly (4.3). */
  value?: number;
  /** The rating at first, when uncontrolled. Default 0. */
  defaultValue?: number;
  /** Called with the new rating when the person sets one. */
  onChange?: (value: number) => void;
  /** Draw the value only: one image, no focus stop and no input. Default: true when `value` is given without `onChange`. */
  readOnly?: boolean;
  /** Number of stars. Default 5. */
  max?: number;
  /** What a key, a hover or a tap moves by: 1 for whole stars, 0.5 for halves. The least a person can give is one step. Default 1. */
  step?: number;
  /** Star size: `sm` 16, `md` 20, `lg` 28 px. Default "md". */
  size?: "sm" | "md" | "lg";
  /** Colour of the filled stars (any CSS colour). Default `--cy-rating-filled` (the warning colour). */
  color?: string | undefined;
  /** Show the number after the stars. */
  showValue?: boolean;
  /** No focus stop and no change. */
  disabled?: boolean;
  /** Submit the value with a form under this name. */
  name?: string | undefined;
  /** Replace the built-in English text. */
  labels?: Partial<RatingLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-rating-* tokens. */
  style?: CSSProperties;
}

const PX = { sm: 16, md: 20, lg: 28 } as const;
/** The star's drawn shape runs from x 3.5 to 20.5 of its 24 grid: fills and the pointer measure across that. */
const START = 3.5 / 24;
const SPAN = 17 / 24;
const solid = { ...star, fill: true as const };
const round = (n: number) => Math.round(n * 100) / 100;
const DEFAULT_LABELS: RatingLabels = {
  value: (value, max) => `${round(value)} out of ${max}`,
  rated: (value, max) => `Rated ${round(value)} out of ${max}`,
};

/**
 * A star rating. Read-only, it draws any value exactly (4.3 fills 30% of the fifth star). Interactive, it is a slider:
 * arrows by `step`, Page Up/Down by a star, Home and End; a hover previews the value under the pointer and a press or
 * tap sets it.
 */
export function Rating({
  label = "Rating",
  value,
  defaultValue = 0,
  onChange,
  readOnly = value !== undefined && onChange === undefined,
  max = 5,
  step = 1,
  size = "md",
  color,
  showValue = false,
  disabled = false,
  name,
  labels,
  className,
  style,
}: RatingProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [current, setCurrent, resetCurrent] = useControllableState(value, defaultValue, onChange);
  const [hover, setHover] = useState<number | null>(null);
  const live = !readOnly && !disabled;
  const shown = Math.min(max, Math.max(0, live && hover !== null ? hover : current));
  const set = (next: number) => {
    const v = Math.min(max, Math.max(step, next));
    if (v !== current) setCurrent(v);
  };
  /** The value under the pointer: the star it is over (the nearest one in a gap), stepped across its drawn shape. */
  const under = (event: PointerEvent<HTMLElement>) => {
    const stars = [...event.currentTarget.querySelectorAll<HTMLElement>(".cy-rating-star")];
    let best = 0;
    let distance = Number.POSITIVE_INFINITY;
    stars.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = event.clientX < r.left ? r.left - event.clientX : Math.max(0, event.clientX - r.right);
      if (d < distance) {
        distance = d;
        best = i;
      }
    });
    const r = (stars[best] as HTMLElement).getBoundingClientRect();
    const from = isRtl(event.currentTarget)
      ? r.right - r.width * START - event.clientX
      : event.clientX - (r.left + r.width * START);
    const across = Math.min(1, Math.max(0, from / (r.width * SPAN)));
    return Math.min(max, Math.max(step, Math.ceil((best + across) / step - 1e-6) * step));
  };
  const stars = Array.from({ length: max }, (_, i) => (
    <span
      key={i}
      className="cy-rating-star"
      style={{ "--_fill": round(Math.min(1, Math.max(0, shown - i))) } as CSSProperties}
    >
      <Icon icon={star} size={PX[size]} className="cy-rating-outline" />
      <span className="cy-rating-filled">
        <Icon icon={solid} size={PX[size]} />
        <Icon icon={star} size={PX[size]} />
      </span>
    </span>
  ));
  const number = showValue && (
    <span className="cy-rating-value" aria-hidden="true">
      {round(shown)}
    </span>
  );
  const root = {
    className: className ? `cy-rating ${className}` : "cy-rating",
    "data-size": size,
    style: { ...(color ? { "--cy-rating-filled": color } : {}), ...style } as CSSProperties,
  };
  if (readOnly)
    return (
      <span {...root} role="img" aria-label={text.rated(current, max)}>
        {stars}
        {number}
      </span>
    );
  return (
    <span {...root} data-disabled={disabled || undefined}>
      <span
        role="slider"
        className="cy-rating-stars"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={round(current)}
        aria-valuetext={text.value(current, max)}
        aria-disabled={disabled || undefined}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          if (!live) return;
          const next = stepKey(event, {
            value: current,
            min: step,
            max,
            step,
            big: 1,
            rtl: isRtl(event.currentTarget),
          });
          if (next === undefined) return;
          event.preventDefault();
          set(next);
        }}
        onPointerMove={(event) => {
          if (live && event.pointerType === "mouse") setHover(under(event));
        }}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(event) => {
          if (!live) return;
          set(under(event));
          setHover(null);
        }}
      >
        {stars}
      </span>
      {number}
      {name !== undefined && (
        <HiddenValue
          name={name}
          value={String(current)}
          disabled={disabled}
          onReset={() => resetCurrent(defaultValue)}
        />
      )}
    </span>
  );
}
