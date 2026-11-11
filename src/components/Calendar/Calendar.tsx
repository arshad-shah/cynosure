import { type CSSProperties, type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { chevronLeft } from "../../icons/chevron-left.js";
import { chevronRight } from "../../icons/chevron-right.js";
import type { Size } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";
import { addDays, addMonths, clampDate, firstDayOfWeek, fromISODate, toISODate } from "./dates.js";

export interface CalendarTokens {
  /** Size of a day cell (it never drops below the touch hit area). */
  cellSize: string;
  /** Background of the selected day. */
  selectedBackground: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    calendar: CalendarTokens;
  }
}

export interface CalendarDayState {
  selected: boolean;
  today: boolean;
  /** A day of the previous or next month, shown to fill the weeks. */
  outside: boolean;
  disabled: boolean;
}

export interface CalendarLabels {
  /** The month buttons. Defaults "Previous month" and "Next month". */
  previous: string;
  next: string;
}

export interface CalendarProps {
  /** The selected date, `YYYY-MM-DD`, or null for none. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (date: string) => void;
  /** The date focus starts on when nothing is selected. Default: today. */
  defaultFocusedDate?: string;
  /** Called when the month shown changes, with its first day (to load that month's events). */
  onMonthChange?: (firstDay: string) => void;
  /** Earliest and latest dates that can be reached and chosen. */
  min?: string | undefined;
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
  labels?: Partial<CalendarLabels>;
  size?: Size;
  className?: string;
  /** Layout only. Restyle through --cy-calendar-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: CalendarLabels = { previous: "Previous month", next: "Next month" };

/**
 * A month of days to pick one from, or to lay out a month's plans on (`renderDay`): the WAI-ARIA APG date grid. One
 * Tab stop on the focused day; arrows move by day and week, Page Up/Down by month (Shift: year), Home/End to the
 * week's ends, Enter or Space chooses.
 */
export function Calendar({
  value,
  defaultValue = null,
  onChange,
  defaultFocusedDate,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  locale,
  weekStartsOn,
  today: todayProp,
  renderDay,
  labels,
  size = "md",
  className,
  style,
}: CalendarProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const today = todayProp ?? toISODate(new Date());
  const [selected, setSelected] = useControllableState<string | null>(
    value,
    defaultValue,
    onChange as ((date: string | null) => void) | undefined,
  );
  const [focused, setFocusedState] = useState(() =>
    clampDate(selected ?? defaultFocusedDate ?? today, min, max),
  );
  const grid = useRef<HTMLTableElement>(null);
  const moveFocus = useRef(false);
  const month = focused.slice(0, 7);

  // An outside change to the selection shows its month.
  const shownValue = useRef(selected);
  if (shownValue.current !== selected) {
    shownValue.current = selected;
    if (selected && selected !== focused) setFocusedState(selected);
  }
  const lastMonth = useRef(month);
  useClientLayoutEffect(() => {
    if (lastMonth.current !== month) {
      lastMonth.current = month;
      onMonthChange?.(`${month}-01`);
    }
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  });

  const focus = (date: string) => {
    setFocusedState(clampDate(date, min, max));
    moveFocus.current = true;
  };
  const off = (date: string) => (min !== undefined && date < min) || (max !== undefined && date > max);
  const disabled = (date: string) => off(date) || !!isDateDisabled?.(date);
  const choose = (date: string) => {
    if (disabled(date)) return;
    setSelected(date);
  };

  // The weeks shown: from the week holding the 1st to the week holding the last day.
  const start = firstDayOfWeek(locale);
  const weekStart = weekStartsOn ?? start;
  const first = fromISODate(`${month}-01`) as Date;
  const lead = (first.getDay() - weekStart + 7) % 7;
  const gridStart = addDays(`${month}-01`, -lead);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((lead + daysInMonth) / 7);
  const rows = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)),
  );

  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(first);
  const weekday = (style: "long" | "short") => new Intl.DateTimeFormat(locale, { weekday: style });
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const dayNumber = new Intl.DateTimeFormat(locale, { day: "numeric" });

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
          className="cy-calendar-flip"
          disabled={min !== undefined && addDays(`${month}-01`, -1) < min}
          onClick={() => setFocusedState((f) => clampDate(addMonths(f, -1), min, max))}
        />
        <span className="cy-calendar-title cy-reset" id={`${id}-title`} aria-live="polite">
          {title}
        </span>
        <IconButton
          icon={chevronRight}
          label={text.next}
          variant="ghost"
          tone="neutral"
          size="sm"
          className="cy-calendar-flip"
          disabled={max !== undefined && nextMonth > max}
          onClick={() => setFocusedState((f) => clampDate(addMonths(f, 1), min, max))}
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
                const state: CalendarDayState = {
                  selected: date === selected,
                  today: date === today,
                  outside: date.slice(0, 7) !== month,
                  disabled: disabled(date),
                };
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
                    data-date={date}
                    className="cy-calendar-day cy-reset"
                    onClick={() => {
                      focus(date);
                      choose(date);
                    }}
                  >
                    {/* The name is the full date (plus any content); the number alone is what is seen. */}
                    <span className="cy-visually-hidden">{fullDate.format(fromISODate(date) as Date)}</span>
                    <span className="cy-calendar-number cy-reset" aria-hidden="true">
                      {dayNumber.format(fromISODate(date) as Date)}
                    </span>
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
