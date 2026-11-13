import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { isTypeaheadKey, seekEnabled, useTypeahead } from "../../foundations/listbox.js";
import { clamp } from "../../foundations/math.js";
import { clock } from "../../icons/clock.js";
import type { Size } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import type { FieldLayoutProps } from "../Field/Field.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover } from "../Popover/Popover.js";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.js";
import { Slider } from "../Slider/Slider.js";
import { TextField } from "../TextField/TextField.js";

export interface TimeFieldTokens {
  rowHeight: string;
  columnWidth: string;
  lensBackground: string;
  night: string;
  day: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    timeField: TimeFieldTokens;
  }
}

export interface TimeFieldLabels {
  /** Shown when the text is not a time. Default "Enter a time as HH:MM" (the field's own placeholder). */
  invalid: string;
  /** Shown when the time is outside `min` and `max`. Default "This time is not available". */
  unavailable: string;
  /** The button that opens the picker, and the picker's name. Default "Choose a time". */
  open: string;
  /** The picker's columns. Defaults "Hours", "Minutes" and "Seconds". */
  hours: string;
  minutes: string;
  seconds: string;
  /** The two halves of the day with `hourCycle={12}`, and the name of their switch. Defaults "AM", "PM", "AM or PM". */
  am: string;
  pm: string;
  period: string;
  /** The strip of the whole day under the columns. Default "Time of day". */
  dayTrack: string;
  /** The button that sets the current time. Default "Now". */
  now: string;
}

export interface TimeFieldProps extends FieldLayoutProps {
  /** The field's visible label, and its accessible name. */
  label: ReactNode;
  /** Hide the label visually; it still names the field. */
  labelHidden?: boolean;
  /** Help text under the field, read with it by screen readers. */
  description?: ReactNode;
  /** Your own error; it replaces the field's own messages. */
  error?: ReactNode;
  /** `HH:MM` (or `HH:MM:SS` with `seconds`), 24-hour whatever `hourCycle` shows, or null when empty. */
  value?: string | null;
  /** The starting time when `value` is not given, in the same form. */
  defaultValue?: string | null;
  /** A valid time (or null when cleared), when typing is finished, the arrows step it or the picker chooses it. */
  onChange?: (time: string | null) => void;
  /** The earliest time allowed, in the same form. Earlier times are explained and not reported. */
  min?: string | undefined;
  /** The latest time allowed, in the same form. Later times are explained and not reported. */
  max?: string | undefined;
  /** Minutes between the picker's minutes, and what the arrows move the minutes by. Default 1 (Shift: ten steps). */
  step?: number;
  /** Include seconds. */
  seconds?: boolean;
  /**
   * How the time is shown: `24` as `21:30`, `12` as `9:30 PM` (with an AM/PM switch in the picker), or `"auto"` to
   * follow the person's own language and region. The value is 24-hour either way. Default "auto".
   */
  hourCycle?: 12 | 24 | "auto";
  /** The language and region `hourCycle="auto"` follows, such as `en-GB`. Default: the browser's. */
  locale?: string | undefined;
  /**
   * Add a clock button that opens a picker: columns for hours and minutes that roll under one lens. Without it the
   * field is only typed in.
   */
  picker?: boolean;
  /** With `picker`: the strip of the whole day under the columns, to click or drag to a time. Default `true`. */
  dayTrack?: boolean;
  /** Form field name. The form receives the 24-hour `HH:MM` value (never the text being typed), however it is shown. */
  name?: string | undefined;
  /** The `id` of a form elsewhere on the page that the field belongs to. */
  form?: string | undefined;
  /** The form cannot be submitted while the field is empty. */
  required?: boolean | undefined;
  /** Cannot be focused, changed or submitted. */
  disabled?: boolean | undefined;
  /** Shown and submitted but not changed: no typing, no arrows and no picker button. */
  readOnly?: boolean | undefined;
  /** Height and text size of the field. Default "md". */
  size?: Size;
  /** Replace the built-in English text: the two messages and the picker's names. */
  labels?: Partial<TimeFieldLabels>;
  /** Added to the root element, for layout. */
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

const HALF = 12 * 3600;
/** `9:30 PM` (or `9:30:15 PM`) from seconds since midnight. */
const formatTime12 = (t: number, seconds: boolean) => {
  const h = Math.floor(t / 3600);
  return `${h % 12 || 12}:${pad(Math.floor(t / 60) % 60)}${seconds ? `:${pad(t % 60)}` : ""} ${h < 12 ? "AM" : "PM"}`;
};

/** Whether a language and region write the time of day with AM and PM. */
const usesAmPm = (locale: string | undefined) =>
  new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hour12 === true;

type Unit = "h" | "m" | "s";
interface Row {
  /** What the row shows. */
  text: string;
  /** The number typed to reach it. */
  typed: string;
  /** The time choosing it gives (before the limits are applied). */
  time: number;
  disabled: boolean;
  selected: boolean;
}
interface Column {
  unit: Unit;
  name: string;
  rows: Row[];
  /** The row the column rests on: the chosen one, or the nearest when the time is between rows. */
  rest: number;
}
const SPAN: Record<Unit, number> = { h: 3600, m: 60, s: 1 };

/**
 * A time of day in a form: type it, step it with the arrows, or pick it from columns that roll under a lens, with a
 * strip of the whole day to jump along. Forgiving as it reads (`930`, `9:30 pm`), strict in what it reports: always
 * 24-hour `HH:MM`, however it is shown.
 */
export function TimeField({
  label,
  labelHidden,
  layout,
  width,
  description,
  error,
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  step = 1,
  seconds = false,
  hourCycle = "auto",
  locale,
  picker = false,
  dayTrack = true,
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
  // The person's own convention is only known in their browser: 24-hour until then, settled before the first paint.
  const [own, setOwn] = useState<12 | 24>(24);
  useClientLayoutEffect(() => {
    if (hourCycle === "auto") setOwn(usesAmPm(locale) ? 12 : 24);
  }, [hourCycle, locale]);
  const h12 = (hourCycle === "auto" ? own : hourCycle) === 12;
  const pattern = `${h12 ? "H:MM" : "HH:MM"}${seconds ? ":SS" : ""}${h12 ? " AM" : ""}`;
  const text: TimeFieldLabels = {
    invalid: `Enter a time as ${pattern}`,
    unavailable: "This time is not available",
    open: "Choose a time",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    am: "AM",
    pm: "PM",
    period: "AM or PM",
    dayTrack: "Time of day",
    now: "Now",
    ...labels,
  };
  const id = useId();
  const [current, setCurrent, resetCurrent] = useControllableState<string | null>(
    value,
    defaultValue,
    onChange,
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  /** Whether the current time of day is inside the limits, read when the picker opens. */
  const [nowAllowed, setNowAllowed] = useState(false);
  /** Raised when a column has been scrolled by hand, so it is put back on its row even if the time did not change. */
  const [settled, setSettled] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const lists = useRef<(HTMLDivElement | null)[]>([]);
  /** A column only chooses by scrolling when a person scrolled it (wheel, finger, drag), never when it was rolled. */
  const byHand = useRef<boolean[]>([]);
  const timers = useRef<(ReturnType<typeof setTimeout> | undefined)[]>([]);
  const justOpened = useRef(false);
  const seek = useTypeahead();
  /** Where the caret goes once a stepped value is rendered, so the next press steps the same part. */
  const caretTo = useRef<number | null>(null);
  useClientLayoutEffect(() => {
    if (caretTo.current === null) return;
    input.current?.setSelectionRange(caretTo.current, caretTo.current);
    caretTo.current = null;
  });
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const lo = min === undefined ? null : parseTime(min);
  const hi = max === undefined ? null : parseTime(max);
  const first = lo ?? 0;
  const last = hi ?? DAY - 1;
  const inRange = (t: number) => t >= first && t <= last;
  const fit = (t: number) => clamp(t, first, last);
  const every = Math.max(1, Math.round(step));

  const currentTime = current === null ? null : parseTime(current);
  const shown = draft ?? (h12 && currentTime !== null ? formatTime12(currentTime, seconds) : (current ?? ""));

  const take = (t: number) => {
    const next = formatTime(t, seconds);
    setDraft(null);
    setProblem(null);
    if (next !== current) setCurrent(next);
  };
  /** What is wrong with typed text, or null when it is empty or an allowed time. */
  const check = (typed: string) => {
    if (typed.trim() === "") return null;
    const t = parseTime(typed);
    return t === null ? text.invalid : inRange(t) ? null : text.unavailable;
  };
  const commit = () => {
    if (draft === null) return;
    if (draft.trim() === "") {
      setDraft(null);
      setProblem(null);
      if (current !== null) setCurrent(null);
      return;
    }
    const wrong = check(draft);
    if (wrong) return setProblem(wrong);
    take(parseTime(draft) as number);
  };
  // A form will not submit while the text is not a time it can take (the value it would submit is the last good one).
  const invalid = draft === null ? null : check(draft);
  useClientLayoutEffect(() => {
    input.current?.setCustomValidity(invalid ?? "");
  }, [invalid]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commit();
    if ((event.key !== "ArrowUp" && event.key !== "ArrowDown") || readOnly) return;
    const from = parseTime(shown);
    if (from === null) return;
    event.preventDefault();
    // The part the caret is in: before the first colon the hours, then the minutes, then the seconds; in AM or PM,
    // the half of the day.
    const caret = event.currentTarget.selectionStart ?? shown.length;
    const colons = shown.slice(0, caret).split(":").length - 1;
    const half = shown.search(/[ap]/i);
    const inHalf = half >= 0 && caret > half;
    const up = event.key === "ArrowUp";
    const times = event.shiftKey && !inHalf ? 10 : 1;
    let by: number;
    if (!inHalf && colons === 1) {
      // Minutes move along the step's grid, the picker's rows (:00, :15, :30, :45): off it, the first step lands on it.
      const m = Math.floor(from / 60) % 60;
      const off = m % every;
      const snap = off === 0 ? 0 : up ? Math.min(m - off + every, 60) - m : -off;
      by = (snap + (up ? 1 : -1) * (times - (snap === 0 ? 0 : 1)) * every) * 60;
    } else {
      by = (up ? 1 : -1) * (inHalf ? HALF : colons === 0 ? 3600 : 1) * times;
    }
    let next = (((from + by) % DAY) + DAY) % DAY;
    if (lo !== null && next < lo) next = lo;
    if (hi !== null && next > hi) next = hi;
    caretTo.current = caret;
    take(next);
  };

  // The picker shows what is typed once it reads as a time, else the value; when there is neither, it rests on the
  // earliest allowed time with nothing chosen.
  const at = draft !== null ? parseTime(draft) : currentTime;
  const whole = fit(at ?? first);
  const base = seconds ? whole : whole - (whole % 60);
  const parts = { h: Math.floor(base / 3600), m: Math.floor(base / 60) % 60, s: base % 60 };
  const allowed = (from: number, to: number) => to >= first && from <= last;
  const column = (unit: Unit, columnName: string, values: number[]): Column => {
    const part = unit === "h" && h12 ? parts.h % 12 || 12 : parts[unit];
    let rest = 0;
    const rows = values.map((v, i) => {
      const hour = unit !== "h" ? parts.h : h12 ? (v % 12) + (parts.h >= 12 ? 12 : 0) : v;
      const time = hour * 3600 + (unit === "m" ? v : parts.m) * 60 + (unit === "s" ? v : parts.s);
      const from = time - (time % SPAN[unit]);
      // Without seconds a minute is one moment (09:30), not the sixty seconds after it.
      const to = from + (unit === "m" && !seconds ? 0 : SPAN[unit] - 1);
      if (Math.abs(v - part) < Math.abs((values[rest] as number) - part)) rest = i;
      return {
        text: unit === "h" && h12 ? String(v) : pad(v),
        typed: String(v),
        time,
        disabled: !allowed(from, to),
        selected: at !== null && v === part,
      };
    });
    return { unit, name: columnName, rows, rest };
  };
  const range = (count: number, by = 1) => Array.from({ length: Math.ceil(count / by) }, (_, i) => i * by);
  const columns = [
    column("h", text.hours, h12 ? [12, ...range(12).slice(1)] : range(24)),
    column("m", text.minutes, range(60, every)),
    ...(seconds ? [column("s", text.seconds, range(60))] : []),
  ];

  const choose = (t: number) => {
    byHand.current = [];
    take(fit(t));
  };
  const setHalf = (pm: boolean) => {
    if (parts.h >= 12 !== pm) choose(base + (pm ? HALF : -HALF));
  };
  const nowTime = () => {
    const d = new Date();
    return ((Math.round((d.getHours() * 60 + d.getMinutes()) / every) * every) % 1440) * 60;
  };
  const toggle = (next: boolean) => {
    if (next) {
      justOpened.current = true;
      setNowAllowed(inRange(nowTime()));
    }
    setOpen(next);
  };
  const close = () => {
    setOpen(false);
    input.current?.focus();
  };

  // Each column rolls so that its row sits in the lens: at once when the picker opens, gliding after that (the
  // stylesheet decides, and reduced motion turns it off). Runs after the Popover has shown the panel, and again
  // (`settled`) after a column was scrolled by hand.
  const rests = columns.map((c) => c.rest).join();
  useEffect(() => {
    if (!open) return;
    const instant = justOpened.current;
    justOpened.current = false;
    rests.split(",").forEach((rest, i) => {
      const list = lists.current[i];
      const row = list?.children[Number(rest)] as HTMLElement | undefined;
      if (!list || !row) return;
      list.scrollTo({
        top: row.offsetTop - (list.clientHeight - row.offsetHeight) / 2,
        behavior: instant ? "instant" : "auto",
      });
    });
  }, [open, rests, settled]);

  // Scrolled by hand, a column chooses the row it comes to rest on (the nearest allowed time when that row is not).
  const onScroll = (i: number) => () => {
    clearTimeout(timers.current[i]);
    timers.current[i] = setTimeout(() => {
      const list = lists.current[i];
      if (!byHand.current[i] || !list) return;
      const middle = list.scrollTop + list.clientHeight / 2;
      let near = 0;
      let gap = Number.POSITIVE_INFINITY;
      ([...list.children] as HTMLElement[]).forEach((row, k) => {
        const d = Math.abs(row.offsetTop + row.offsetHeight / 2 - middle);
        if (d < gap) [near, gap] = [k, d];
      });
      const row = columns[i]?.rows[near];
      if (row) choose(row.time);
      setSettled((n) => n + 1);
    }, 120);
  };
  const onListKey = (i: number) => (event: KeyboardEvent<HTMLDivElement>) => {
    const col = columns[i] as Column;
    const count = col.rows.length;
    const usable = (k: number) => !col.rows[k]?.disabled;
    const go = (k: number) => {
      event.preventDefault();
      const row = col.rows[k];
      if (row) choose(row.time);
    };
    if (event.key === "ArrowDown") return go(seekEnabled(count, col.rest, 1, usable));
    if (event.key === "ArrowUp") return go(seekEnabled(count, col.rest, -1, usable));
    if (event.key === "Home") return go(seekEnabled(count, -1, 1, usable));
    if (event.key === "End") return go(seekEnabled(count, count, -1, usable));
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      lists.current[i + (event.key === "ArrowRight" ? 1 : -1)]?.focus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      close();
    } else if (h12 && isTypeaheadKey(event) && /^[ap]$/i.test(event.key)) {
      setHalf(event.key.toLowerCase() === "p");
    } else if (isTypeaheadKey(event)) {
      const to = seek(
        event.key,
        col.rows.map((row) => (row.disabled ? null : row.typed)),
        col.rest,
      );
      if (to >= 0) go(to);
    }
  };
  const scrolledByHand = (i: number) => () => {
    byHand.current[i] = true;
  };
  const percent = (t: number) => `${(t / DAY) * 100}%`;

  const hasPicker = picker && !readOnly;
  return (
    <>
      <TextField
        ref={input}
        label={label}
        {...(labelHidden ? { labelHidden } : {})}
        layout={layout}
        width={width}
        {...(description !== undefined ? { description } : {})}
        {...((error ?? problem) != null ? { error: error ?? problem } : {})}
        value={shown}
        onChange={setDraft}
        onBlur={commit}
        onKeyDown={onKeyDown}
        placeholder={pattern}
        inputMode={h12 ? "text" : "numeric"}
        autoComplete="off"
        {...(hasPicker ? {} : { iconStart: clock })}
        form={form}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        className={className ? `cy-time-field ${className}` : "cy-time-field"}
        {...(style ? { style } : {})}
        addonEnd={
          hasPicker && (
            <Popover
              label={text.open}
              open={open}
              onOpenChange={toggle}
              placement="bottom"
              trigger={(props) => (
                <IconButton
                  {...props}
                  icon={clock}
                  label={text.open}
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  className="cy-time-field-open"
                />
              )}
            >
              <div className="cy-time-field-picker">
                <div className="cy-time-field-wheel cy-reset">
                  <div className="cy-time-field-drum cy-reset" dir="ltr">
                    <div className="cy-time-field-lens cy-reset" />
                    {columns.map((col, i) => (
                      <Fragment key={col.unit}>
                        {i > 0 && (
                          <span className="cy-time-field-colon cy-reset" aria-hidden="true">
                            :
                          </span>
                        )}
                        <div
                          ref={(el) => {
                            lists.current[i] = el;
                          }}
                          role="listbox"
                          tabIndex={0}
                          aria-label={col.name}
                          aria-activedescendant={
                            col.rows.some((row) => row.selected) ? `${id}-${col.unit}-${col.rest}` : undefined
                          }
                          className="cy-time-field-column cy-reset"
                          onKeyDown={onListKey(i)}
                          onClick={(event) => {
                            const option = (event.target as HTMLElement).closest<HTMLElement>("[data-index]");
                            const row = col.rows[Number(option?.dataset.index ?? -1)];
                            if (row && !row.disabled) choose(row.time);
                          }}
                          onScroll={onScroll(i)}
                          onWheel={scrolledByHand(i)}
                          onTouchStart={scrolledByHand(i)}
                          onPointerDown={scrolledByHand(i)}
                        >
                          {col.rows.map((row, k) => (
                            <div
                              key={row.typed}
                              id={`${id}-${col.unit}-${k}`}
                              role="option"
                              aria-selected={row.selected}
                              aria-disabled={row.disabled || undefined}
                              tabIndex={-1}
                              data-index={k}
                              className="cy-time-field-option cy-reset"
                            >
                              {row.text}
                            </div>
                          ))}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  {h12 && (
                    <SegmentedControl
                      label={text.period}
                      size="sm"
                      value={parts.h >= 12 ? "pm" : "am"}
                      onChange={(half) => setHalf(half === "pm")}
                      options={[
                        { value: "am", label: text.am, disabled: !allowed(0, HALF - 1) },
                        { value: "pm", label: text.pm, disabled: !allowed(HALF, DAY - 1) },
                      ]}
                    />
                  )}
                </div>
                {dayTrack && (
                  <Slider
                    label={text.dayTrack}
                    labelHidden
                    min={0}
                    max={1440}
                    step={every}
                    largeStep={60}
                    size="sm"
                    value={Math.floor(base / 60)}
                    onChange={(minutes) => choose(Math.min(minutes as number, 1440 - every) * 60)}
                    marks={[0, 6, 12, 18, 24].map((h) => ({
                      value: h * 60,
                      ...(h % 24 === 0
                        ? {}
                        : { label: h12 ? `${h % 12 || 12} ${h < 12 ? text.am : text.pm}` : pad(h) }),
                    }))}
                    labels={{
                      value: (minutes) => {
                        const t = Math.min(minutes, 1439) * 60;
                        return h12 ? formatTime12(t, false) : formatTime(t);
                      },
                    }}
                    className="cy-time-field-track"
                    trackContent={
                      <div
                        className="cy-time-field-day cy-reset"
                        style={
                          { "--_open-from": percent(first), "--_open-to": percent(last) } as CSSProperties
                        }
                      />
                    }
                  />
                )}
                {nowAllowed && (
                  <div className="cy-time-field-foot cy-reset">
                    <Button variant="ghost" size="sm" onClick={() => choose(nowTime())}>
                      {text.now}
                    </Button>
                  </div>
                )}
              </div>
            </Popover>
          )
        }
      />
      {/* The form receives the value, never the text being typed: 21:30 even when it is shown as 9:30 PM. */}
      <HiddenValue
        name={name}
        form={form}
        value={current ?? ""}
        disabled={disabled}
        onReset={() => {
          setDraft(null);
          setProblem(null);
          resetCurrent(defaultValue);
        }}
      />
    </>
  );
}
