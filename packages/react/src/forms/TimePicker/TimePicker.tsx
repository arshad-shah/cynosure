import type { Time } from '@internationalized/date';
import { ChevronDown, Clock } from 'lucide-react';
import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useCallback,
  useState,
} from 'react';
import type { TimeValue } from 'react-aria-components';
import {
  Button as AriaButton,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Group as AriaGroup,
  Popover as AriaPopover,
  TimeField as AriaTimeField,
  type TimeFieldProps as AriaTimeFieldProps,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import {
  dateSegments,
  leadWell,
  pickerRoot,
  segment,
  segsWell,
  triggerWell,
} from '../DatePicker/DatePicker.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import { timePopover } from './TimePicker.css.js';
import { TimePickerWheel } from './TimePickerWheel.js';

const ClockIcon = (): ReactElement => <Clock size={16} strokeWidth={2} aria-hidden />;
const ChevronDownIcon = (): ReactElement => (
  <ChevronDown size={16} strokeWidth={2.25} aria-hidden />
);

/** Cynosure-specific props for `<TimePicker>`. */
export interface TimePickerOwnProps {
  /** Visible label, also used as the picker's accessible name when a string. */
  label?: ReactNode;
  /** Accepted for API parity with other form controls. */
  size?: FormControlSize;
  /**
   * Visual treatment.
   * @default "outline"
   */
  variant?: FormControlVariant;
  /** Renders the invalid state. */
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
  /**
   * Step in minutes for the wheel's minute column.
   * @default 1
   */
  minuteStep?: number;
}

type NativeTimePickerProps<T extends TimeValue> = Omit<
  AriaTimeFieldProps<T>,
  'className' | 'style' | 'children' | 'value' | 'defaultValue' | 'onChange'
>;

export type TimePickerProps<T extends TimeValue = TimeValue> = TimePickerOwnProps &
  NativeTimePickerProps<T> & {
    value?: T | null;
    defaultValue?: T | null;
    onChange?: (value: T | null) => void;
  };

/**
 * `TimePicker` is a segmented time input with a wheel-style popover for
 * picking hour/minute (and AM/PM when the locale uses 12-hour cycle). Backed
 * by React Aria's `TimeField`; fully keyboard accessible.
 */
export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  function TimePicker(props, ref) {
    const {
      label,
      size: _size,
      variant = 'outline',
      invalid,
      className,
      style,
      isDisabled,
      isReadOnly,
      minuteStep,
      hourCycle,
      value,
      defaultValue,
      onChange,
      ...rest
    } = props;

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<TimeValue | null>(defaultValue ?? null);
    const current = (isControlled ? (value ?? null) : internal) as TimeValue | null;

    const commit = useCallback(
      (next: TimeValue | null) => {
        if (!isControlled) setInternal(next);
        onChange?.(next as TimeValue);
      },
      [isControlled, onChange],
    );

    return (
      <AriaTimeField
        {...rest}
        ref={ref}
        hourCycle={hourCycle}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isInvalid={invalid}
        value={current}
        onChange={commit}
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
            <ClockIcon />
          </span>
          <AriaDateInput className={cn(segsWell, dateSegments)}>
            {(seg) => <AriaDateSegment segment={seg} className={segment} />}
          </AriaDateInput>
          <AriaDialogTrigger>
            <AriaButton
              className={triggerWell}
              aria-label="Open time picker"
              isDisabled={isDisabled || isReadOnly}
            >
              <ChevronDownIcon />
            </AriaButton>
            <AriaPopover className={timePopover} placement="bottom end">
              <AriaDialog>
                <TimePickerWheel
                  value={current}
                  onChange={(t: Time) => commit(t as unknown as TimeValue)}
                  hourCycle={hourCycle}
                  minuteStep={minuteStep}
                />
              </AriaDialog>
            </AriaPopover>
          </AriaDialogTrigger>
        </AriaGroup>
      </AriaTimeField>
    );
  },
);
