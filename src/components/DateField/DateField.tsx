import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useControllableState } from "../../foundations/controllable.js";
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
  label: ReactNode;
  labelHidden?: boolean;
  description?: ReactNode;
  /** Your own error; it replaces the field's own messages. */
  error?: ReactNode;
  /** `YYYY-MM-DD`, or null when empty. */
  value?: string | null;
  defaultValue?: string | null;
  /** A valid, available date (or null when cleared), when typing is finished or a day is picked. */
  onChange?: (date: string | null) => void;
  min?: string | undefined;
  max?: string | undefined;
  isDateDisabled?: ((date: string) => boolean) | undefined;
  /** The calendar's locale and first day of the week. */
  locale?: string | undefined;
  weekStartsOn?: number | undefined;
  today?: string | undefined;
  name?: string | undefined;
  form?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  size?: Size;
  labels?: Partial<DateFieldLabels>;
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
  const id = useId();
  const [current, setCurrent] = useControllableState<string | null>(value, defaultValue, onChange);
  const [draft, setDraft] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const available = (date: string) =>
    !(min !== undefined && date < min) && !(max !== undefined && date > max) && !isDateDisabled?.(date);
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
    if (!isISODate(typed)) return setProblem(text.invalid);
    if (!available(typed)) return setProblem(text.unavailable);
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

  // The picker opens on the chosen day (the APG date picker), not on its first button.
  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${id}-calendar`)
      ?.querySelector<HTMLElement>('[data-date][tabindex="0"]')
      ?.focus();
  }, [open, id]);

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
      placeholder="YYYY-MM-DD"
      inputMode="numeric"
      autoComplete="off"
      name={name}
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
            <div id={`${id}-calendar`} className="cy-date-field-calendar">
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
  );
}
