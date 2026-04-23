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

export interface DatePickerOwnProps<T extends DateValue = DateValue> {
  label?: ReactNode;
  /** Accepted for API parity with other form controls; visual effect is minor in the punched design. */
  size?: FormControlSize;
  /** Accepted for API parity with other form controls; visual effect is minor in the punched design. */
  variant?: FormControlVariant;
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (value: T | null) => void;
}

type NativeDatePickerProps<T extends DateValue> = Omit<
  AriaDatePickerProps<T>,
  'className' | 'style' | 'children' | 'value' | 'defaultValue' | 'onChange'
>;

export type DatePickerProps<T extends DateValue = DateValue> = DatePickerOwnProps<T> &
  NativeDatePickerProps<T>;

/** Single-date picker. Backed by React Aria `DatePicker` + `@internationalized/date`. */
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
