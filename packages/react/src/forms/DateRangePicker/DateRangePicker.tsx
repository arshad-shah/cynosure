import { type CSSProperties, type ReactNode, forwardRef } from 'react';
import type { DateValue } from 'react-aria-components';
import {
  Button as AriaButton,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  DateInput as AriaDateInput,
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  DateSegment as AriaDateSegment,
  Dialog as AriaDialog,
  Group as AriaGroup,
  Heading as AriaHeading,
  Popover as AriaPopover,
  RangeCalendar as AriaRangeCalendar,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import {
  calendarCell,
  calendarGrid,
  calendarGridHeaderCell,
  calendarHeader,
  calendarNavButton,
  calendarTitle,
  calendarWrap,
  dateSegments,
  fieldGroup,
  rangeSeparator,
  segment,
  triggerButton,
} from '../DatePicker/DatePicker.css.js';
import { controlSize, controlWrapperBase, controlWrapperVariant } from '../shared/control.css.js';
import { popover } from '../shared/popover.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';

const CalendarIcon = (): React.ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ChevronLeft = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m15 6-6 6 6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m9 6 6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface DateRangePickerOwnProps {
  label?: ReactNode;
  size?: FormControlSize;
  variant?: FormControlVariant;
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
}

type NativeDateRangePickerProps<T extends DateValue> = Omit<
  AriaDateRangePickerProps<T>,
  'className' | 'style' | 'children'
>;

export type DateRangePickerProps<T extends DateValue = DateValue> = DateRangePickerOwnProps &
  NativeDateRangePickerProps<T>;

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  function DateRangePicker(props, ref) {
    const {
      label,
      size = 'md',
      variant = 'outline',
      invalid,
      className,
      style,
      isDisabled,
      isReadOnly,
      ...rest
    } = props;

    const wrapperClass = cn(
      controlWrapperBase,
      controlWrapperVariant[variant],
      controlSize[size],
      className,
    );

    return (
      <AriaDateRangePicker
        {...rest}
        ref={ref}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isInvalid={invalid}
        aria-label={rest['aria-label'] ?? (typeof label === 'string' ? label : undefined)}
      >
        <AriaGroup
          className={wrapperClass}
          data-disabled={isDisabled || undefined}
          data-readonly={isReadOnly || undefined}
          data-invalid={invalid || undefined}
          style={style}
        >
          <div className={fieldGroup}>
            <AriaDateInput slot="start" className={dateSegments}>
              {(seg) => <AriaDateSegment segment={seg} className={segment} />}
            </AriaDateInput>
            <span aria-hidden="true" className={rangeSeparator}>
              →
            </span>
            <AriaDateInput slot="end" className={dateSegments}>
              {(seg) => <AriaDateSegment segment={seg} className={segment} />}
            </AriaDateInput>
            <AriaButton className={triggerButton} aria-label="Open calendar">
              <CalendarIcon />
            </AriaButton>
          </div>
        </AriaGroup>
        <AriaPopover className={popover} placement="bottom start">
          <AriaDialog className={calendarWrap}>
            <AriaRangeCalendar>
              <div className={calendarHeader}>
                <AriaButton
                  slot="previous"
                  className={calendarNavButton}
                  aria-label="Previous month"
                >
                  <ChevronLeft />
                </AriaButton>
                <AriaHeading className={calendarTitle} />
                <AriaButton slot="next" className={calendarNavButton} aria-label="Next month">
                  <ChevronRight />
                </AriaButton>
              </div>
              <AriaCalendarGrid className={calendarGrid}>
                <AriaCalendarGridHeader>
                  {(day) => (
                    <AriaCalendarHeaderCell className={calendarGridHeaderCell}>
                      {day}
                    </AriaCalendarHeaderCell>
                  )}
                </AriaCalendarGridHeader>
                <AriaCalendarGridBody>
                  {(date) => <AriaCalendarCell date={date} className={calendarCell} />}
                </AriaCalendarGridBody>
              </AriaCalendarGrid>
            </AriaRangeCalendar>
          </AriaDialog>
        </AriaPopover>
      </AriaDateRangePicker>
    );
  },
);
