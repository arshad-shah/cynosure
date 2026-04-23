import { ArrowRight, CalendarDays, ChevronDown } from 'lucide-react';
import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useContext,
} from 'react';
import type { DateValue } from 'react-aria-components';
import {
  Button as AriaButton,
  DateInput as AriaDateInput,
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  DateSegment as AriaDateSegment,
  Dialog as AriaDialog,
  Group as AriaGroup,
  Popover as AriaPopover,
  DateRangePickerStateContext,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import { RangeCalendar } from '../Calendar/index.js';
import {
  dateSegments,
  leadWell,
  pickerRoot,
  rangeSeparator,
  segment,
  segsWell,
  triggerWell,
} from '../DatePicker/DatePicker.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import {
  calendarArea,
  clearLink,
  kbd,
  kbdChip,
  kbdHintGroup,
  rangeFooter,
  rangePopover,
  rangePopoverInner,
} from './DateRangePicker.css.js';
import { DateRangePickerPresets, type DateRangePreset } from './DateRangePickerPresets.js';

const CalendarIcon = (): ReactElement => <CalendarDays size={16} strokeWidth={2} aria-hidden />;
const Arrow = (): ReactElement => <ArrowRight size={14} strokeWidth={2} aria-hidden />;
const ChevronDownIcon = (): ReactElement => (
  <ChevronDown size={16} strokeWidth={2.25} aria-hidden />
);

export type { DateRangePreset };

export interface DateRangePickerOwnProps {
  label?: ReactNode;
  size?: FormControlSize;
  variant?: FormControlVariant;
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Quick-range presets rendered in the left rail. Rail is hidden when omitted. */
  presets?: DateRangePreset[];
  /** How many months to show side-by-side. Collapses to 1 below 640px regardless. Default 2. */
  visibleMonths?: 1 | 2;
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
      size: _size,
      variant = 'outline',
      invalid,
      className,
      style,
      isDisabled,
      isReadOnly,
      presets,
      visibleMonths = 2,
      ...rest
    } = props;

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
          <AriaDateInput slot="start" className={cn(segsWell, dateSegments)}>
            {(seg) => <AriaDateSegment segment={seg} className={segment} />}
          </AriaDateInput>
          <span aria-hidden="true" className={rangeSeparator}>
            <Arrow />
          </span>
          <AriaDateInput slot="end" className={cn(segsWell, dateSegments)}>
            {(seg) => <AriaDateSegment segment={seg} className={segment} />}
          </AriaDateInput>
          <AriaButton className={triggerWell} aria-label="Open calendar">
            <ChevronDownIcon />
          </AriaButton>
        </AriaGroup>
        <AriaPopover className={rangePopover} placement="bottom start">
          <AriaDialog>
            <div className={rangePopoverInner}>
              {presets && presets.length > 0 ? <DateRangePickerPresets presets={presets} /> : null}
              <div className={calendarArea}>
                <RangeCalendar visibleMonths={visibleMonths} footer={<RangeFooter />} />
              </div>
            </div>
          </AriaDialog>
        </AriaPopover>
      </AriaDateRangePicker>
    );
  },
);

function RangeFooter(): ReactElement {
  const state = useContext(DateRangePickerStateContext);
  const hasRange = state != null && state.value?.start != null && state.value?.end != null;
  return (
    <div className={rangeFooter}>
      <div className={kbdHintGroup}>
        <span className={kbdChip}>
          <kbd className={kbd}>↵</kbd> select
        </span>
        <span className={kbdChip}>
          <kbd className={kbd}>Esc</kbd> close
        </span>
      </div>
      {hasRange && state ? (
        <button
          type="button"
          className={clearLink}
          onClick={() => {
            state.setValue(null);
          }}
        >
          Clear
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
