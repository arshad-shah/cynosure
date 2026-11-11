import { type CSSProperties, type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { clock } from "../../icons/clock.js";
import type { Size } from "../../tokens/schema.js";
import { TextField } from "../TextField/TextField.js";

export interface TimeFieldLabels {
  /** Shown when the text is not a time. Default "Enter a time as HH:MM" (or HH:MM:SS with `seconds`). */
  invalid: string;
  /** Shown when the time is outside `min` and `max`. Default "This time is not available". */
  unavailable: string;
}

export interface TimeFieldProps {
  label: ReactNode;
  labelHidden?: boolean;
  description?: ReactNode;
  /** Your own error; it replaces the field's own messages. */
  error?: ReactNode;
  /** `HH:MM` (or `HH:MM:SS` with `seconds`), 24-hour, or null when empty. */
  value?: string | null;
  defaultValue?: string | null;
  /** A valid time (or null when cleared), when typing is finished or the arrows step it. */
  onChange?: (time: string | null) => void;
  /** Earliest and latest times, in the same form. */
  min?: string | undefined;
  max?: string | undefined;
  /** Minutes the arrows move the minutes by. Default 1 (Shift: ten steps). */
  step?: number;
  /** Include seconds. */
  seconds?: boolean;
  name?: string | undefined;
  form?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  size?: Size;
  labels?: Partial<TimeFieldLabels>;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DAY = 24 * 3600;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Seconds since midnight from what was typed: `9`, `930`, `0930`, `9:30`, `21:15:30`, `9:30 pm`, `12am`. Null when it
 * is not a time of day.
 */
export function parseTime(text: string): number | null {
  const m = /^\s*(\d{1,2})(?::?(\d{2}))?(?::?(\d{2}))?\s*([ap]\.?m\.?)?\s*$/i.exec(text);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const sec = Number(m[3] ?? 0);
  const half = m[4]?.[0]?.toLowerCase();
  if (half) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (half === "p" ? 12 : 0);
  }
  if (h > 23 || min > 59 || sec > 59) return null;
  return h * 3600 + min * 60 + sec;
}

/** `HH:MM` (or `HH:MM:SS`) from seconds since midnight. */
export const formatTime = (total: number, seconds = false) => {
  const t = ((total % DAY) + DAY) % DAY;
  const hm = `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}`;
  return seconds ? `${hm}:${pad(t % 60)}` : hm;
};

/**
 * A time of day in a form, typed in 24-hour `HH:MM`. Forgiving as it reads (`930`, `9:30 pm`), strict in what it
 * reports, and Up/Down step the hours, minutes or seconds the caret is in.
 */
export function TimeField({
  label,
  labelHidden,
  description,
  error,
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  step = 1,
  seconds = false,
  name,
  form,
  required,
  disabled = false,
  readOnly = false,
  size = "md",
  labels,
  className,
  style,
}: TimeFieldProps) {
  const text: TimeFieldLabels = {
    invalid: `Enter a time as ${seconds ? "HH:MM:SS" : "HH:MM"}`,
    unavailable: "This time is not available",
    ...labels,
  };
  const [current, setCurrent] = useControllableState<string | null>(value, defaultValue, onChange);
  const [draft, setDraft] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  /** Where the caret goes once a stepped value is rendered, so the next press steps the same part. */
  const caretTo = useRef<number | null>(null);
  useClientLayoutEffect(() => {
    if (caretTo.current === null) return;
    input.current?.setSelectionRange(caretTo.current, caretTo.current);
    caretTo.current = null;
  });
  const lo = min === undefined ? null : parseTime(min);
  const hi = max === undefined ? null : parseTime(max);
  const inRange = (t: number) => (lo === null || t >= lo) && (hi === null || t <= hi);

  const take = (t: number) => {
    const next = formatTime(t, seconds);
    setDraft(null);
    setProblem(null);
    if (next !== current) setCurrent(next);
  };
  const commit = () => {
    if (draft === null) return;
    if (draft.trim() === "") {
      setDraft(null);
      setProblem(null);
      if (current !== null) setCurrent(null);
      return;
    }
    const t = parseTime(draft);
    if (t === null) return setProblem(text.invalid);
    if (!inRange(t)) return setProblem(text.unavailable);
    take(t);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commit();
    if ((event.key !== "ArrowUp" && event.key !== "ArrowDown") || readOnly) return;
    const shown = draft ?? current ?? "";
    const from = parseTime(shown);
    if (from === null) return;
    event.preventDefault();
    // The part the caret is in: before the first colon the hours, then the minutes, then the seconds.
    const caret = event.currentTarget.selectionStart ?? shown.length;
    const colons = shown.slice(0, caret).split(":").length - 1;
    const unit = colons === 0 ? 3600 : colons === 1 ? 60 * step : 1;
    const by = (event.key === "ArrowUp" ? 1 : -1) * unit * (event.shiftKey ? 10 : 1);
    let next = (((from + by) % DAY) + DAY) % DAY;
    if (lo !== null && next < lo) next = lo;
    if (hi !== null && next > hi) next = hi;
    caretTo.current = caret;
    take(next);
  };

  return (
    <TextField
      ref={input}
      label={label}
      {...(labelHidden ? { labelHidden } : {})}
      {...(description !== undefined ? { description } : {})}
      {...((error ?? problem) != null ? { error: error ?? problem } : {})}
      value={draft ?? current ?? ""}
      onChange={setDraft}
      onBlur={commit}
      onKeyDown={onKeyDown}
      placeholder={seconds ? "HH:MM:SS" : "HH:MM"}
      inputMode="numeric"
      autoComplete="off"
      iconStart={clock}
      name={name}
      form={form}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      className={className ? `cy-time-field ${className}` : "cy-time-field"}
      {...(style ? { style } : {})}
    />
  );
}
