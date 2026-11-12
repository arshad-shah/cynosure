import { type CSSProperties, type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { chevronDown } from "../../icons/chevron-down.js";
import { chevronLeft } from "../../icons/chevron-left.js";
import { chevronRight } from "../../icons/chevron-right.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover } from "../Popover/Popover.js";
import {
  addDays,
  addMonths,
  clampDate,
  firstDayOfWeek,
  fromISODate,
  inMonth,
  toISODate,
  weekendDays,
} from "./dates.js";

export interface CalendarTokens {
  /** Size of a day cell (it never drops below the touch hit area). */
  cellSize: string;
  /** Background of the selected day. */
  selectedBackground: string;
  /** With `renderDay`: the least height of a day (never below the hit area). */
  contentSize: string;
  /** How much of a marked day's tone is mixed into its background (a percentage). */
  toneMix: string;
  /** Size of a day's dots. */
  dotSize: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    calendar: CalendarTokens;
  }
}

export interface CalendarDayState {
  /** The day is the selected date. */
  selected: boolean;
  /** The day is today. */
  today: boolean;
  /** A day of the previous or next month, shown to fill the weeks. */
  outside: boolean;
  /** The day cannot be chosen: outside `min` and `max`, or `isDateDisabled`. */
  disabled: boolean;
  /** A weekend day in the `locale` (Saturday and Sunday where the browser does not know the locale's weekend). */
  weekend: boolean;
}

/** How `markDay` marks a day. Every part is optional. */
export interface CalendarDayMark {
  /** Tints the day's background softly with this tone. Give a `label` too when the colour means something. */
  tone?: Tone | undefined;
  /**
   * Small dots under the day's number, one per entry: a tone, or any CSS colour (a category's colour). At most three
   * are drawn; further entries are dropped.
   */
  dots?: readonly (Tone | (string & {}))[] | undefined;
  /** Added to the day's accessible name after its date ("3 tasks", "Weekend"), so the marks are not colour alone. */
  label?: string | undefined;
}

export interface CalendarLabels {
  /** The button to the month before. Default "Previous month". */
  previous: string;
  /** The button to the month after. Default "Next month". */
  next: string;
  /** With `monthPicker`: names the panel of months and years, and is added to the heading button's name. Default "Choose month and year". */
  monthPicker: string;
  /** With `monthPicker`: the button to the year before. Default "Previous year". */
  previousYear: string;
  /** With `monthPicker`: the button to the year after. Default "Next year". */
  nextYear: string;
}

export interface CalendarProps {
  /** The selected date, `YYYY-MM-DD`, or null for none. */
  value?: string | null;
  /** The date selected at first, when uncontrolled. */
  defaultValue?: string | null;
  /** Called when a day is chosen, with its date as `YYYY-MM-DD`. */
  onChange?: (date: string) => void;
  /** The date focus starts on when nothing is selected. Default: today. */
  defaultFocusedDate?: string;
  /**
   * The month shown, controlled: `YYYY-MM`, or any `YYYY-MM-DD` date of that month. The grid then only moves when this
   * changes: paging, the month picker, keys that leave the month and choosing a day of another month call
   * `onMonthChange` and wait for it. A new `value` in another month does not move a controlled month.
   */
  month?: string | undefined;
  /** The month shown at first, when uncontrolled (`YYYY-MM` or `YYYY-MM-DD`). Default: the month of the selected or focused date. */
  defaultMonth?: string | undefined;
  /**
   * Called with the first day of a month (`YYYY-MM-01`) when the month shown changes (to load that month's events) or,
   * with `month`, when another month is asked for.
   */
  onMonthChange?: (firstDay: string) => void;
  /**
   * Turns the month heading into a button that opens a panel to jump to any month and year. Months and years outside
   * `min` and `max` cannot be chosen. Default false.
   */
  monthPicker?: boolean | undefined;
  /** Earliest and latest dates that can be reached and chosen. */
  min?: string | undefined;
  /** Latest date (`YYYY-MM-DD`) that can be reached and chosen. */
  max?: string | undefined;
  /** Dates that can be focused but not chosen (fully booked, weekends). */
  isDateDisabled?: ((date: string) => boolean) | undefined;
  /** Locale for month and day names (and the first day of the week). Default: the browser's. */
  locale?: string | undefined;
  /** 0 Sunday to 6 Saturday. Default: the locale's first day, else Monday. */
  weekStartsOn?: number | undefined;
  /** What counts as today. Default: the device's date. */
  today?: string | undefined;
  /** Extra content inside a day, under its number: a dot for events, a planner's items. */
  renderDay?: ((date: string, state: CalendarDayState) => ReactNode) | undefined;
  /**
   * Marks a day without drawing it: return `{ tone, dots, label }` to tint its background, put up to three dots under
   * its number and add words to its name, or nothing to leave it plain. Weekends: `(_, day) => day.weekend ? { tone:
   * "neutral", label: "Weekend" } : undefined`.
   */
  markDay?: ((date: string, state: CalendarDayState) => CalendarDayMark | undefined) | undefined;
  /** Replace the built-in English text: the month buttons, and the month picker's name and year buttons. */
  labels?: Partial<CalendarLabels>;
  /** Size of the day cells and text. Default "md". */
  size?: Size;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-calendar-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: CalendarLabels = {
  previous: "Previous month",
  next: "Next month",
  monthPicker: "Choose month and year",
  previousYear: "Previous year",
  nextYear: "Next year",
};

const TONES: readonly string[] = ["accent", "neutral", "danger", "success", "warning", "info"];
const MAX_DOTS = 3;
const MONTHS = Array.from({ length: 12 }, (_, i) => i);
/** What the calendar is drawn with until the browser's own language and weekend are known. */
const SERVER_LOCALE = "en-US";
const SERVER_WEEKEND = [6, 0];

const formats = new Map<string, Intl.DateTimeFormat>();
/** A date formatter, built once per locale and options: a month draws about forty names, on every render. */
function dateFormat(locale: string | undefined, options: Intl.DateTimeFormatOptions) {
  const key = `${locale ?? ""} ${JSON.stringify(options)}`;
  let format = formats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, options);
    formats.set(key, format);
  }
  return format;
}

/** The heading as a button, and its panel: a year to step through and that year's twelve months. */
function MonthPicker({
  month,
  children,
  onPick,
  min,
  max,
  locale,
  text,
  size,
}: {
  month: string;
  children: ReactNode;
  onPick: (month: string) => void;
  min: string | undefined;
  max: string | undefined;
  locale: string | undefined;
  text: CalendarLabels;
  size: Size;
}) {
  // The year the panel shows while open; null while closed.
  const [year, setYear] = useState<number | null>(null);
  const shown = year ?? Number(month.slice(0, 4));
  const name = (style: "long" | "short", i: number) =>
    dateFormat(locale, { month: style }).format(new Date(2001, i, 1));
  const yearStep = (by: number, label: string, icon: typeof chevronLeft, off: boolean) => (
    <IconButton
      icon={icon}
      label={label}
      variant="ghost"
      tone="neutral"
      size="sm"
      flipRtl
      disabled={off}
      onClick={() => setYear(shown + by)}
    />
  );
  return (
    <Popover
      label={text.monthPicker}
      size="sm"
      open={year !== null}
      onOpenChange={(open) => setYear(open ? Number(month.slice(0, 4)) : null)}
      trigger={(props) => (
        <Button
          {...props}
          variant="ghost"
          tone="neutral"
          size={size === "lg" ? "md" : "sm"}
          iconEnd={chevronDown}
          className="cy-calendar-jump"
        >
          {children}
          <span className="cy-visually-hidden">{text.monthPicker}</span>
        </Button>
      )}
    >
      <div className="cy-calendar-picker cy-reset">
        <div className="cy-calendar-head cy-reset">
          {yearStep(
            -1,
            text.previousYear,
            chevronLeft,
            min !== undefined && shown <= Number(min.slice(0, 4)),
          )}
          <span className="cy-calendar-title cy-reset" aria-live="polite">
            {dateFormat(locale, { year: "numeric" }).format(new Date(shown, 0, 1))}
          </span>
          {yearStep(1, text.nextYear, chevronRight, max !== undefined && shown >= Number(max.slice(0, 4)))}
        </div>
        <div className="cy-calendar-months cy-reset">
          {MONTHS.map((i) => {
            const at = `${String(shown).padStart(4, "0")}-${String(i + 1).padStart(2, "0")}`;
            return (
              <Button
                key={at}
                variant={at === month ? "soft" : "ghost"}
                tone={at === month ? "accent" : "neutral"}
                size="sm"
                fullWidth
                aria-label={`${name("long", i)} ${shown}`}
                aria-current={at === month || undefined}
                disabled={
                  (min !== undefined && at < min.slice(0, 7)) || (max !== undefined && at > max.slice(0, 7))
                }
                onClick={() => {
                  setYear(null);
                  onPick(at);
                }}
              >
                {name("short", i)}
              </Button>
            );
          })}
        </div>
      </div>
    </Popover>
  );
}

/**
 * A month of days to pick one from, or to lay out a month's plans on (`renderDay`, `markDay`): the WAI-ARIA APG date
 * grid. One Tab stop on the focused day; arrows move by day and week, Page Up/Down by month (Shift: year), Home/End to
 * the week's ends, Enter or Space chooses.
 */
export function Calendar({
  value,
  defaultValue = null,
  onChange,
  defaultFocusedDate,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  monthPicker = false,
  min,
  max,
  isDateDisabled,
  locale,
  weekStartsOn,
  today: todayProp,
  renderDay,
  markDay,
  labels,
  size = "md",
  className,
  style,
}: CalendarProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  // The device's date, its language and the default locale are only known in the browser. Until they settle there
  // (before the first paint), the calendar draws what a server would: no day marked as today, names in `locale` or
  // English, weeks from Monday with a Saturday and Sunday weekend. So the server's markup and the browser's match.
  const [settled, setSettled] = useState(false);
  useClientLayoutEffect(() => setSettled(true), []);
  const today = todayProp ?? (settled ? toISODate(new Date()) : null);
  const names = settled ? locale : (locale ?? SERVER_LOCALE);
  /** Where the calendar starts when nothing else says: today (on a server, the server's date). */
  const start = () => todayProp ?? toISODate(new Date());
  const [selected, setSelected] = useControllableState<string | null>(
    value,
    defaultValue,
    onChange as ((date: string | null) => void) | undefined,
  );
  const [month, setMonth] = useControllableState<string>(
    monthProp?.slice(0, 7),
    () => (defaultMonth ?? clampDate(selected ?? defaultFocusedDate ?? start(), min, max)).slice(0, 7),
    (next) => onMonthChange?.(`${next}-01`),
  );
  // The focused day is always a day of the month shown: the same day number, kept within the limits where it can be.
  const within = (date: string, m: string) => {
    if (date.slice(0, 7) === m) return date;
    const day = clampDate(inMonth(date, m), min, max);
    return day.slice(0, 7) === m ? day : inMonth(date, m);
  };
  const [focused, setFocusedState] = useState(() =>
    within(clampDate(selected ?? defaultFocusedDate ?? start(), min, max), month),
  );
  const grid = useRef<HTMLTableElement>(null);
  const moveFocus = useRef(false);
  // The day to focus once its month is shown (asked for with the keys, a click, or a new value).
  const pending = useRef<string | null>(null);
  // A month to show after this render: an outside change to the selection, when the month is not controlled.
  const follow = useRef<string | null>(null);

  let day = focused;
  const shownValue = useRef(selected);
  if (shownValue.current !== selected) {
    shownValue.current = selected;
    if (selected?.slice(0, 7) === month) day = selected;
    else if (selected) {
      pending.current = selected;
      if (monthProp === undefined) follow.current = selected.slice(0, 7);
    }
  }
  const shownMonth = useRef(month);
  if (shownMonth.current !== month) {
    shownMonth.current = month;
    day = within(pending.current ?? day, month);
    pending.current = null;
    // Focus that was on a day stays in the grid, on the new month's day.
    if (grid.current?.contains(grid.current.ownerDocument.activeElement)) moveFocus.current = true;
  }
  if (day !== focused) setFocusedState(day);

  useClientLayoutEffect(() => {
    const next = follow.current;
    follow.current = null;
    if (next && next !== month) setMonth(next);
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  });

  // The month as of the last request, so two presses before a render move two months.
  const live = useRef(month);
  live.current = month;
  /** Shows a month (or, when the month is controlled, asks for it), with the day to focus there. */
  const show = (m: string, date: string | null = null) => {
    pending.current = date;
    if (m === live.current) return;
    if (monthProp === undefined) live.current = m;
    setMonth(m);
  };
  const page = (by: number) => show(addMonths(`${live.current}-01`, by).slice(0, 7));
  const focus = (date: string) => {
    const to = clampDate(date, min, max);
    if (to.slice(0, 7) !== month) return show(to.slice(0, 7), to);
    if (to === focused) return;
    moveFocus.current = true;
    setFocusedState(to);
  };
  const off = (date: string) => (min !== undefined && date < min) || (max !== undefined && date > max);
  const disabled = (date: string) => off(date) || !!isDateDisabled?.(date);
  const choose = (date: string) => {
    if (disabled(date)) return;
    setSelected(date);
  };

  // The weeks shown: from the week holding the 1st to the week holding the last day.
  const weekStart = weekStartsOn ?? (settled ? firstDayOfWeek(locale) : 1);
  const weekend = settled ? weekendDays(locale) : SERVER_WEEKEND;
  const first = fromISODate(`${month}-01`) as Date;
  const lead = (first.getDay() - weekStart + 7) % 7;
  const gridStart = addDays(`${month}-01`, -lead);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((lead + daysInMonth) / 7);
  const rows = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)),
  );

  const weekday = (style: "long" | "short") => dateFormat(names, { weekday: style });
  const fullDate = dateFormat(names, { dateStyle: "full" });
  const dayNumber = dateFormat(names, { day: "numeric" });

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const across = isRtl(event.currentTarget) ? -1 : 1;
    const dow = ((fromISODate(focused) as Date).getDay() - weekStart + 7) % 7;
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -across),
      ArrowRight: () => addDays(focused, across),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -dow),
      End: () => addDays(focused, 6 - dow),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(focused);
      return;
    }
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    focus(move());
  };

  const nextMonth = addMonths(`${month}-01`, 1);
  const title = (
    <span className="cy-calendar-title cy-reset" id={`${id}-title`} aria-live="polite">
      {dateFormat(names, { month: "long", year: "numeric" }).format(first)}
    </span>
  );
  return (
    <div
      className={className ? `cy-calendar ${className}` : "cy-calendar"}
      data-size={size}
      data-days={renderDay ? "" : undefined}
      style={style}
    >
      <div className="cy-calendar-head cy-reset">
        <IconButton
          icon={chevronLeft}
          label={text.previous}
          variant="ghost"
          tone="neutral"
          size="sm"
          flipRtl
          disabled={min !== undefined && addDays(`${month}-01`, -1) < min}
          onClick={() => page(-1)}
        />
        {monthPicker ? (
          <MonthPicker month={month} onPick={show} min={min} max={max} locale={names} text={text} size={size}>
            {title}
          </MonthPicker>
        ) : (
          title
        )}
        <IconButton
          icon={chevronRight}
          label={text.next}
          variant="ghost"
          tone="neutral"
          size="sm"
          flipRtl
          disabled={max !== undefined && nextMonth > max}
          onClick={() => page(1)}
        />
      </div>
      <table
        ref={grid}
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the APG date grid is a table with role grid
        role="grid"
        aria-labelledby={`${id}-title`}
        className="cy-calendar-grid cy-reset"
        onKeyDown={onKeyDown}
      >
        <thead className="cy-reset">
          <tr className="cy-reset">
            {(rows[0] as string[]).map((date) => {
              const d = fromISODate(date) as Date;
              return (
                <th
                  key={date}
                  scope="col"
                  abbr={weekday("long").format(d)}
                  className="cy-calendar-weekday cy-reset"
                >
                  {weekday("short").format(d)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="cy-reset">
          {rows.map((week) => (
            <tr key={week[0]} className="cy-reset">
              {week.map((date) => {
                const at = fromISODate(date) as Date;
                const state: CalendarDayState = {
                  selected: date === selected,
                  today: date === today,
                  outside: date.slice(0, 7) !== month,
                  disabled: disabled(date),
                  weekend: weekend.includes(at.getDay()),
                };
                const mark = markDay?.(date, state);
                const dots = mark?.dots?.slice(0, MAX_DOTS);
                return (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: the grid handles the keys for every day (roving focus)
                  <td
                    key={date}
                    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: a day of the APG date grid
                    role="gridcell"
                    tabIndex={date === focused ? 0 : -1}
                    aria-selected={state.selected}
                    aria-disabled={state.disabled || undefined}
                    aria-current={state.today ? "date" : undefined}
                    data-outside={state.outside ? "" : undefined}
                    data-tone={mark?.tone}
                    data-date={date}
                    className="cy-calendar-day cy-reset"
                    onClick={() => {
                      focus(date);
                      choose(date);
                    }}
                  >
                    {/* The name is the full date, any mark's label, then any content; the number alone is seen. */}
                    <span className="cy-visually-hidden">
                      {fullDate.format(at)}
                      {mark?.label && `, ${mark.label}`}
                    </span>
                    <span className="cy-calendar-number cy-reset" aria-hidden="true">
                      {dayNumber.format(at)}
                    </span>
                    {dots && dots.length > 0 && (
                      <span className="cy-calendar-dots cy-reset" aria-hidden="true">
                        {dots.map((dot, i) => {
                          const tone = TONES.includes(dot);
                          return (
                            <span
                              key={`${i}${dot}`}
                              className="cy-calendar-dot cy-reset"
                              data-tone={tone ? dot : undefined}
                              style={tone ? undefined : ({ "--_tone": dot } as CSSProperties)}
                            />
                          );
                        })}
                      </span>
                    )}
                    {renderDay && (
                      <span className="cy-calendar-extra cy-reset">{renderDay(date, state)}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
