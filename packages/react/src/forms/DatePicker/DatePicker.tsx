import { getLocalTimeZone, today } from '@internationalized/date';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { type CSSProperties, type ReactNode, forwardRef, useMemo, useState } from 'react';
import type { DateValue } from 'react-aria-components';
import {
  Button as AriaButton,
  DateInput as AriaDateInput,
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  DateSegment as AriaDateSegment,
  Dialog as AriaDialog,
  Group as AriaGroup,
  Popover as AriaPopover,
  useLocale,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import { Calendar } from '../Calendar/index.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import {
  calendarFooter,
  calendarFooterTodayLabel,
  calendarFooterTodayValue,
  calendarPopover,
  dateSegments,
  goToTodayLink,
  leadWell,
  pickerRoot,
  segment,
  segsWell,
  triggerWell,
} from './DatePicker.css.js';

const CalendarIcon = (): React.ReactElement => (
  <CalendarDays size={16} strokeWidth={2} aria-hidden />
);
const ChevronDownIcon = (): React.ReactElement => (
  <ChevronDown size={16} strokeWidth={2.25} aria-hidden />
);

/** Cynosure-specific props for `<DatePicker>`. */
export interface DatePickerOwnProps<T extends DateValue = DateValue> {
  /** Visible label, also used as the picker's accessible name when a string. */
  label?: ReactNode;
  /** Accepted for API parity with other form controls; visual effect is minor in the segmented design. */
  size?: FormControlSize;
  /**
   * Tints the segmented track: `outline` (light well + hairline border),
   * `filled` (deeper solid tint), `ghost` (transparent; tiles flat at rest).
   * @default "outline"
   */
  variant?: FormControlVariant;
  /** Renders the invalid state. */
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Controlled date value. */
  value?: T | null;
  /** Uncontrolled initial value. */
  defaultValue?: T | null;
  /** Fires with the next value when the user picks a date or clears the input. */
  onChange?: (value: T | null) => void;
}

type NativeDatePickerProps<T extends DateValue> = Omit<
  AriaDatePickerProps<T>,
  'className' | 'style' | 'children' | 'value' | 'defaultValue' | 'onChange'
>;

export type DatePickerProps<T extends DateValue = DateValue> = DatePickerOwnProps<T> &
  NativeDatePickerProps<T>;

/**
 * `DatePicker` is a single-date picker — segmented input with a popover
 * calendar. Includes a "Go to today" footer affordance.
 *
 * Backed by React Aria's `DatePicker` and `@internationalized/date` for
 * timezone- and locale-aware date handling. Fully keyboard accessible.
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      label,
      size: _size,
      variant = 'outline',
      invalid,
      className,
      style,
      isDisabled,
      isReadOnly,
      value,
      defaultValue,
      onChange,
      ...rest
    } = props;

    return (
      <AriaDatePicker
        {...rest}
        ref={ref}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isInvalid={invalid}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        aria-label={rest['aria-label'] ?? (typeof label === 'string' ? label : undefined)}
      >
        <AriaGroup
          className={cn(pickerRoot, className)}
          data-variant={variant}
          data-disabled={isDisabled || undefined}
          data-readonly={isReadOnly || undefined}
          data-invalid={invalid || undefined}
          style={style}
        >
          <span className={leadWell} aria-hidden>
            <CalendarIcon />
          </span>
          <AriaDateInput className={cn(segsWell, dateSegments)}>
            {(seg) => <AriaDateSegment segment={seg} className={segment} />}
          </AriaDateInput>
          <AriaButton className={triggerWell} aria-label="Open calendar">
            <ChevronDownIcon />
          </AriaButton>
        </AriaGroup>
        <AriaPopover className={calendarPopover} placement="bottom start">
          <AriaDialog>
            <DateCalendarWithFooter />
          </AriaDialog>
        </AriaPopover>
      </AriaDatePicker>
    );
  },
);

/** Calendar + "Go to today" footer — kept internal so the main component stays flat. */
function DateCalendarWithFooter(): React.ReactElement {
  const { locale } = useLocale();
  const tz = getLocalTimeZone();
  const todayDate = useMemo(() => today(tz), [tz]);
  const [focusedValue, setFocusedValue] = useState<DateValue | undefined>(undefined);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(todayDate.toDate(tz)),
    [locale, todayDate, tz],
  );

  return (
    <Calendar
      focusedValue={focusedValue}
      onFocusChange={setFocusedValue}
      footer={
        <div className={calendarFooter}>
          <span className={calendarFooterTodayLabel}>
            Today is <span className={calendarFooterTodayValue}>{todayLabel}</span>
          </span>
          <button
            type="button"
            className={goToTodayLink}
            onClick={() => setFocusedValue(todayDate)}
          >
            Go to today
          </button>
        </div>
      }
    />
  );
}
