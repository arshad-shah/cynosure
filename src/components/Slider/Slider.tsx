import { type CSSProperties, type KeyboardEvent, type ReactNode, useCallback, useId, useRef } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { useDrag } from "../../foundations/drag.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { stepKey } from "../../foundations/keys.js";
import { clamp, plainNumber, roundLike } from "../../foundations/math.js";
import type { Size } from "../../tokens/schema.js";

export interface SliderTokens {
  trackSm: string;
  trackMd: string;
  trackLg: string;
  thumbSm: string;
  thumbMd: string;
  thumbLg: string;
  track: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    slider: SliderTokens;
  }
}

/** One number, or several: `[from, to]` for a range, or more (gradient stops), one thumb each. */
export type SliderValue = number | number[];

export interface SliderLabels {
  /** Names of the two thumbs of a range, added to the label ("Price, minimum"). */
  minimum: string;
  maximum: string;
  /** Names of the thumbs when there are more than two, added to the label. Default "stop 3". */
  thumb: (index: number, count: number) => string;
  /** Text for a value, shown with `showValue` and read by screen readers. Default: the number. */
  value: (value: number) => string;
}

export interface SliderMark {
  value: number;
  /** Short text under the track; marks without one are ticks. */
  label?: string;
}

export interface SliderProps {
  /** Accessible name, shown above the slider unless `labelHidden`. */
  label: string;
  /** Visually hide the label (it still names the slider). */
  labelHidden?: boolean;
  /** A number, `[from, to]` for a range, or more numbers for more thumbs (each stays between its neighbours). */
  value?: SliderValue;
  /** Starting value when uncontrolled. Default: `min`. */
  defaultValue?: SliderValue;
  /** Every change while dragging or pressing keys. */
  onChange?: (value: SliderValue) => void;
  /** When a change is finished: pointer released, or after each key press. */
  onCommit?: (value: SliderValue) => void;
  /** Lowest value. Default 0. */
  min?: number;
  /** Highest value. Default 100. */
  max?: number;
  /** Values snap to this step, and the arrow keys move by it. Default 1. */
  step?: number;
  /** Page Up and Page Down step (default a tenth of the range). */
  largeStep?: number;
  /** `vertical` runs bottom to top. Default "horizontal". */
  orientation?: "horizontal" | "vertical";
  /** Ticks on the track, with optional text under them. */
  marks?: SliderMark[];
  /**
   * Your own drawing of the track (a gradient, a histogram, a waveform), filling it under the thumbs. The accent fill
   * is not drawn then.
   */
  trackContent?: ReactNode;
  /** Show the current value (or range) at the end of the label row. */
  showValue?: boolean;
  /** Form field name; a range submits two values under it. */
  name?: string;
  /** Not focusable, cannot be changed and not submitted. */
  disabled?: boolean;
  /** Track and thumb size. Default "md". */
  size?: Size;
  /** Replace the built-in English text: the thumb names and the value text. */
  labels?: Partial<SliderLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-slider-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: SliderLabels = {
  minimum: "minimum",
  maximum: "maximum",
  thumb: (index) => `stop ${index + 1}`,
  value: plainNumber,
};

/** Picks a number (or a range) by dragging or with the keyboard: APG slider, with pointer, touch and forms. */
/** The thumb being dragged, and the value to go back to if the drag is cancelled. */
interface Drag {
  index: number;
  from: SliderValue;
}

export function Slider({
  label,
  labelHidden = false,
  value,
  defaultValue,
  onChange,
  onCommit,
  min = 0,
  max = 100,
  step = 1,
  largeStep,
  orientation = "horizontal",
  marks,
  trackContent,
  showValue = false,
  name,
  disabled = false,
  size = "md",
  labels,
  className,
  style,
}: SliderProps) {
  const id = useId();
  const text = { ...DEFAULT_LABELS, ...labels };
  const initial = defaultValue ?? min;
  const [current, setCurrent, resetCurrent] = useControllableState<SliderValue>(value, initial, onChange);
  const range = Array.isArray(current);
  // A controlled value outside min and max shows (and is announced) at the nearest end.
  const values: number[] = (range ? current : [current]).map((v) => clamp(v, min, max));
  const track = useRef<HTMLDivElement>(null);
  const thumbs = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef<Drag | null>(null);
  const big = largeStep ?? Math.max(step, (max - min) / 10);
  const vertical = orientation === "vertical";

  const snap = useCallback(
    (v: number) => {
      const stepped = min + Math.round((v - min) / step) * step;
      return roundLike(clamp(stepped, min, max), step, min);
    },
    [min, max, step],
  );
  /** New value with thumb `index` moved to `v`; thumbs stop at their neighbours instead of crossing. */
  const withThumb = (index: number, v: number): SliderValue => {
    if (!range) return snap(v);
    const next = [...values];
    next[index] = clamp(snap(v), values[index - 1] ?? min, values[index + 1] ?? max);
    return next;
  };
  const set = (next: SliderValue, commit: boolean) => {
    const same = Array.isArray(next) ? next.every((n, i) => n === values[i]) : next === values[0];
    if (!same) {
      setCurrent(next);
    }
    if (commit) onCommit?.(next);
  };

  const fromPoint = (point: { x: number; y: number }) => {
    const box = (track.current as HTMLDivElement).getBoundingClientRect();
    const rtl = !vertical && isRtl(track.current as HTMLDivElement);
    let ratio = vertical ? (box.bottom - point.y) / box.height : (point.x - box.left) / box.width;
    if (rtl) ratio = 1 - ratio;
    return min + clamp(ratio) * (max - min);
  };
  // Dragging through detent: the press moves the nearest thumb there, a drag follows, Escape puts it back.
  useDrag(track, {
    // The track's CSS keeps pan-y (pan-x when vertical), so a swipe across it still scrolls the page.
    touchAction: "css",
    onStart: ({ point }) => {
      if (disabled) return false;
      const v = fromPoint(point);
      // The nearest thumb takes the press; among thumbs on one spot, the one that can still move that way.
      const distances = values.map((n) => Math.abs(n - v));
      const nearest = Math.min(...distances);
      const tied = distances.flatMap((d, i) => (d === nearest ? [i] : []));
      const index = (v < (values[tied[0] as number] as number) ? tied[0] : tied[tied.length - 1]) as number;
      drag.current = { index, from: range ? [...values] : (values[0] as number) };
      thumbs.current[index]?.focus({ preventScroll: true });
      set(withThumb(index, v), false);
    },
    onMove: ({ point }) => set(withThumb((drag.current as Drag).index, fromPoint(point)), false),
    onEnd: ({ point }, cancelled) => {
      const d = drag.current as Drag;
      drag.current = null;
      set(cancelled ? d.from : withThumb(d.index, fromPoint(point)), true);
    },
  });

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLDivElement>) => {
    const now = values[index] as number;
    const rtl = !vertical && isRtl(event.currentTarget);
    const target = stepKey(event, { value: now, min, max, step, big, rtl });
    if (target === undefined) return;
    event.preventDefault();
    set(withThumb(index, target), true);
  };

  const position = (v: number) => `${((v - min) / (max - min || 1)) * 100}%`;
  const valueText = range
    ? values.map(text.value).join(values.length === 2 ? " – " : ", ")
    : text.value(values[0] as number);
  const fill = range
    ? { "--_from": position(values[0] as number), "--_to": position(values[values.length - 1] as number) }
    : { "--_from": "0%", "--_to": position(values[0] as number) };
  const thumbName = (index: number) =>
    values.length === 2 ? (index === 0 ? text.minimum : text.maximum) : text.thumb(index, values.length);

  return (
    <div
      className={className ? `cy-slider ${className}` : "cy-slider"}
      // A range is a group of two sliders named by the label; a single slider is named directly.
      {...(range
        ? { role: "group", ...(labelHidden ? { "aria-label": label } : { "aria-labelledby": `${id}-label` }) }
        : {})}
      data-orientation={orientation}
      data-range={range || undefined}
      data-size={size}
      data-disabled={disabled || undefined}
      style={style}
    >
      {(!labelHidden || showValue) && (
        <div className="cy-slider-head cy-reset">
          {!labelHidden && (
            <span id={`${id}-label`} className="cy-slider-label cy-reset">
              {label}
            </span>
          )}
          {showValue && (
            <span className="cy-slider-value cy-reset" aria-hidden="true">
              {valueText}
            </span>
          )}
        </div>
      )}
      <div
        ref={track}
        className="cy-slider-track cy-reset"
        style={fill as CSSProperties}
        data-custom={trackContent !== undefined ? "" : undefined}
      >
        {trackContent !== undefined ? (
          <div className="cy-slider-drawing cy-reset" aria-hidden="true">
            {trackContent}
          </div>
        ) : (
          <div className="cy-slider-fill cy-reset" />
        )}
        {marks?.map((mark) => (
          <span
            key={mark.value}
            className="cy-slider-mark cy-reset"
            aria-hidden="true"
            style={{ "--_pos": position(mark.value) } as CSSProperties}
            data-label={mark.label ? "" : undefined}
          >
            {mark.label && <span className="cy-slider-mark-label cy-reset">{mark.label}</span>}
          </span>
        ))}
        {values.map((v, index) => (
          <div
            key={index}
            ref={(el) => {
              thumbs.current[index] = el;
            }}
            role="slider"
            tabIndex={disabled ? undefined : 0}
            className="cy-slider-thumb cy-reset"
            aria-orientation={orientation}
            aria-valuemin={values[index - 1] ?? min}
            aria-valuemax={values[index + 1] ?? max}
            aria-valuenow={plainNumber(v) as unknown as number}
            aria-valuetext={text.value(v)}
            aria-disabled={disabled || undefined}
            {...(range
              ? { "aria-label": `${label}, ${thumbName(index)}` }
              : labelHidden
                ? { "aria-label": label }
                : { "aria-labelledby": `${id}-label` })}
            style={{ "--_pos": position(v) } as CSSProperties}
            onKeyDown={disabled ? undefined : onKeyDown(index)}
          />
        ))}
      </div>
      {values.map((v, index) => (
        <HiddenValue
          key={index}
          name={name}
          value={plainNumber(v)}
          disabled={disabled}
          onReset={() => {
            resetCurrent(initial);
          }}
        />
      ))}
    </div>
  );
}
