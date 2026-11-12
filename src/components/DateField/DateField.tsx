import { type CSSProperties, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { calendar } from "../../icons/calendar.js";
import type { Size } from "../../tokens/schema.js";
import { Calendar } from "../Calendar/Calendar.js";
import { addDays, addMonths, isISODate } from "../Calendar/dates.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover } from "../Popover/Popover.js";
import { TextField } from "../TextField/TextField.js";

export interface DateFieldLabels {
  /** The button that opens the calendar. Default "Choose a date". */
  open: string;
  /** Shown when the text is not a date. Default "Enter a date as YYYY-MM-DD". */
  invalid: string;
  /** Shown when the date is outside `min` and `max`, or not available. Default "This date is not available". */
  unavailable: string;
  /** The calendar's month buttons. */
  previous: string;
  next: string;
}

export interface DateFieldProps {
  /** Visible label; it names the field. */
  label: ReactNode;
  /** Visually hide the label (it still names the field). Prefer visible labels. */
  labelHidden?: boolean;
  /** Help text shown below the field. */
  description?: ReactNode;
  /** Your own error; it replaces the field's own messages. */
  error?: ReactNode;
  /** `YYYY-MM-DD`, or null when empty. */
  value?: string | null;
  /** Starting date when uncontrolled, as `YYYY-MM-DD`. */
  defaultValue?: string | null;
  /** A valid, available date (or null when cleared), when typing is finished or a day is picked. */
  onChange?: (date: string | null) => void;
  /** Earliest date that can be typed or picked, as `YYYY-MM-DD`. */
  min?: string | undefined;
  /** Latest date that can be typed or picked, as `YYYY-MM-DD`. */
  max?: string | undefined;
  /** Return true for dates that cannot be chosen (fully booked, weekends). */
  isDateDisabled?: ((date: string) => boolean) | undefined;
  /** The calendar's locale and first day of the week. */
  locale?: string | undefined;
  /** 0 Sunday to 6 Saturday. Default: the locale's first day, else Monday. */
  weekStartsOn?: number | undefined;
  /** What the calendar counts as today, as `YYYY-MM-DD`. Default: the device's date. */
  today?: string | undefined;
  /** Name the date (`YYYY-MM-DD`, or empty) is submitted under in a form; text being typed is never submitted. */
  name?: string | undefined;
  /** Id of the form it belongs to, when it is not inside that form. */
  form?: string | undefined;
  /** Marks the field as required for form validation. */
  required?: boolean | undefined;
  /** Turns off the field and the calendar button. */
  disabled?: boolean | undefined;
  /** The date can be read but not changed; the calendar button is hidden. */
  readOnly?: boolean | undefined;
  /** Size of the field. Default "md". */
  size?: Size;
  /** Replace the built-in English text: the calendar button, the two error messages and the month buttons. */
  labels?: Partial<DateFieldLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: DateFieldLabels = {
  open: "Choose a date",
  invalid: "Enter a date as YYYY-MM-DD",
  unavailable: "This date is not available",
  previous: "Previous month",
  next: "Next month",
};

/** `2026-1-5`, `2026/01/05` and `2026.1.5` all read as `2026-01-05`; anything else is left as it was typed. */
const normalise = (text: string) => {
  const m = /^\s*(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\s*$/.exec(text);
  return m
    ? `${m[1]}-${(m[2] as string).padStart(2, "0")}-${(m[3] as string).padStart(2, "0")}`
    : text.trim();
};

/**
 * A date in a form: type it as `YYYY-MM-DD`, step it with the arrows, or pick it from a Calendar in a popover. The
 * value is a plain date string (no time, no time zone) and is only reported once it is a real, available date.
 */
export function DateField({
  label,
  labelHidden,
  description,
  error,
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  isDateDisabled,
  locale,
  weekStartsOn,
  today,
  name,
  form,
  required,
  disabled = false,
  readOnly = false,
  size = "md",
  labels,
  className,
  style,
}: DateFieldProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [current, setCurrent, resetCurrent] = useControllableState<string | null>(
    value,
    defaultValue,
    onChange,
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const calendarBox = useRef<HTMLDivElement>(null);

  const available = (date: string) =>
    !(min !== undefined && date < min) && !(max !== undefined && date > max) && !isDateDisabled?.(date);
  /** What is wrong with typed text (already normalised), or null when it is empty or a real, available date. */
  const check = (typed: string) =>
    typed === "" ? null : !isISODate(typed) ? text.invalid : !available(typed) ? text.unavailable : null;
  /** Takes what was typed: a real, available date is kept; anything else is explained and left for correcting. */
  const commit = () => {
    if (draft === null) return;
    const typed = normalise(draft);
    if (typed === "") {
      setDraft(null);
      setProblem(null);
      if (current !== null) setCurrent(null);
      return;
    }
    const wrong = check(typed);
    if (wrong) return setProblem(wrong);
    setDraft(null);
    setProblem(null);
    if (typed !== current) setCurrent(typed);
  };
  const choose = (date: string) => {
    setDraft(null);
    setProblem(null);
    if (date !== current) setCurrent(date);
  };

  // Up and Down step the date by a day (Shift: a month), skipping nothing: limits stop it.
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commit();
    if ((event.key !== "ArrowUp" && event.key !== "ArrowDown") || readOnly) return;
    const from = draft === null ? current : isISODate(normalise(draft)) ? normalise(draft) : null;
    if (!from) return;
    event.preventDefault();
    const by = event.key === "ArrowUp" ? 1 : -1;
    const next = event.shiftKey ? addMonths(from, by) : addDays(from, by);
    if ((min !== undefined && next < min) || (max !== undefined && next > max)) return;
    choose(next);
  };

  // A form will not submit while the text is not a date it can take (the value it would submit is the last good one).
  const invalid = draft === null ? null : check(normalise(draft));
  useClientLayoutEffect(() => {
    input.current?.setCustomValidity(invalid ?? "");
  }, [invalid]);

  // The picker opens on the chosen day (the APG date picker), not on its first button. A ref, not an id lookup, so it
  // works inside a shadow root.
  useEffect(() => {
    if (!open) return;
    calendarBox.current?.querySelector<HTMLElement>('[data-date][tabindex="0"]')?.focus();
  }, [open]);

  return (
    <>
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
        placeholder="YYYY-MM-DD"
        inputMode="numeric"
        autoComplete="off"
        form={form}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        className={className ? `cy-date-field ${className}` : "cy-date-field"}
        {...(style ? { style } : {})}
        addonEnd={
          !readOnly && (
            <Popover
              label={text.open}
              open={open}
              onOpenChange={setOpen}
              placement="bottom"
              size="sm"
              trigger={(props) => (
                <IconButton
                  {...props}
                  icon={calendar}
                  label={text.open}
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  className="cy-date-field-open"
                />
              )}
            >
              <div ref={calendarBox} className="cy-date-field-calendar">
                <Calendar
                  value={draft !== null && isISODate(normalise(draft)) ? normalise(draft) : current}
                  onChange={(date) => {
                    choose(date);
                    setOpen(false);
                    input.current?.focus();
                  }}
                  min={min}
                  max={max}
                  isDateDisabled={isDateDisabled}
                  locale={locale}
                  weekStartsOn={weekStartsOn}
                  today={today}
                  size="sm"
                  labels={{ previous: text.previous, next: text.next }}
                />
              </div>
            </Popover>
          )
        }
      />
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
