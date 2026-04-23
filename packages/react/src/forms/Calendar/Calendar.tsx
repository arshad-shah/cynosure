import type { CSSProperties, ReactElement, ReactNode } from 'react';
import {
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  type CalendarProps as AriaCalendarProps,
  RangeCalendar as AriaRangeCalendar,
  type RangeCalendarProps as AriaRangeCalendarProps,
  type DateValue,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import {
  calendarCell,
  calendarGrid,
  calendarGridHeaderCell,
  calendarMonthsGrid,
  calendarRoot,
  calendarSecondMonth,
} from './Calendar.css.js';
import { CalendarHeader } from './CalendarHeader.js';

export interface CalendarBaseProps {
  className?: string;
  style?: CSSProperties;
  /** Number of months shown side by side. Default `1`. Use `2` for range-heavy UIs. */
  visibleMonths?: 1 | 2;
  /** Footer rendered below the grid — e.g. "Go to today" or keyboard hints. */
  footer?: ReactNode;
}

/** One calendar month grid — header cells + day cells, no chrome. */
function MonthGrid({ offset }: { offset?: { months: number } }): ReactElement {
  return (
    <AriaCalendarGrid className={calendarGrid} offset={offset}>
      <AriaCalendarGridHeader>
        {(day) => (
          <AriaCalendarHeaderCell className={calendarGridHeaderCell}>{day}</AriaCalendarHeaderCell>
        )}
      </AriaCalendarGridHeader>
      <AriaCalendarGridBody>
        {(date) => <AriaCalendarCell date={date} className={calendarCell} />}
      </AriaCalendarGridBody>
    </AriaCalendarGrid>
  );
}

export type CalendarProps<T extends DateValue = DateValue> = CalendarBaseProps &
  Omit<AriaCalendarProps<T>, 'className' | 'style' | 'children'>;

/**
 * Standalone single-date Calendar. Renders a month grid with prev/next
 * navigation and a shared styling language with DatePicker / DateRangePicker.
 *
 * Pass `footer` to slot in custom content (e.g. "Go to today"). Use
 * `visibleMonths={2}` for dual-month layouts.
 */
export function Calendar<T extends DateValue = DateValue>({
  className,
  style,
  visibleMonths = 1,
  footer,
  ...rest
}: CalendarProps<T>): ReactElement {
  return (
    <div className={cn(calendarRoot, className)} style={style} data-months={visibleMonths}>
      <AriaCalendar<T> {...rest}>
        <CalendarHeader />
        {visibleMonths === 2 ? (
          <div className={calendarMonthsGrid}>
            <MonthGrid />
            <div className={calendarSecondMonth}>
              <MonthGrid offset={{ months: 1 }} />
            </div>
          </div>
        ) : (
          <MonthGrid />
        )}
      </AriaCalendar>
      {footer}
    </div>
  );
}

export type RangeCalendarProps<T extends DateValue = DateValue> = CalendarBaseProps &
  Omit<AriaRangeCalendarProps<T>, 'className' | 'style' | 'children' | 'visibleDuration'>;

/**
 * Standalone range Calendar — selects a start/end date pair across one or two
 * months. Same styling language as `Calendar`; drop `footer` in for presets,
 * hints, or a clear button.
 */
export function RangeCalendar<T extends DateValue = DateValue>({
  className,
  style,
  visibleMonths = 2,
  footer,
  ...rest
}: RangeCalendarProps<T>): ReactElement {
  return (
    <div className={cn(calendarRoot, className)} style={style} data-months={visibleMonths}>
      <AriaRangeCalendar<T>
        {...rest}
        visibleDuration={visibleMonths === 2 ? { months: 2 } : { months: 1 }}
      >
        <CalendarHeader />
        <div className={calendarMonthsGrid}>
          <MonthGrid />
          {visibleMonths === 2 ? (
            <div className={calendarSecondMonth}>
              <MonthGrid offset={{ months: 1 }} />
            </div>
          ) : null}
        </div>
      </AriaRangeCalendar>
      {footer}
    </div>
  );
}
