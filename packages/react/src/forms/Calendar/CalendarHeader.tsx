import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { Button as AriaButton, Heading as AriaHeading } from 'react-aria-components';
import { calendarHeader, calendarNavButton, calendarTitle } from './Calendar.css.js';

export interface CalendarHeaderProps {
  /** Hide the previous-month button. Used for the right month in a dual-month layout. */
  hidePrev?: boolean;
  /** Hide the next-month button. Used for the left month in a dual-month layout. */
  hideNext?: boolean;
  /** Hide the month title. Used when two months render separate headers but share a visual group. */
  hideTitle?: boolean;
}

/** Header bar with prev/next nav and the month title; wires into RAC's Calendar slots. */
export function CalendarHeader({
  hidePrev,
  hideNext,
  hideTitle,
}: CalendarHeaderProps): ReactElement {
  return (
    <div className={calendarHeader}>
      {hidePrev ? (
        <span style={{ width: '2rem' }} aria-hidden />
      ) : (
        <AriaButton slot="previous" className={calendarNavButton} aria-label="Previous month">
          <ChevronLeft size={16} strokeWidth={2.25} aria-hidden />
        </AriaButton>
      )}
      {hideTitle ? <span /> : <AriaHeading className={calendarTitle} />}
      {hideNext ? (
        <span style={{ width: '2rem' }} aria-hidden />
      ) : (
        <AriaButton slot="next" className={calendarNavButton} aria-label="Next month">
          <ChevronRight size={16} strokeWidth={2.25} aria-hidden />
        </AriaButton>
      )}
    </div>
  );
}
