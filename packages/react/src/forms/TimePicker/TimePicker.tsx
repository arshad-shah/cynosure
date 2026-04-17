import { type CSSProperties, type ReactNode, forwardRef } from 'react';
import type { TimeValue } from 'react-aria-components';
import {
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  Group as AriaGroup,
  TimeField as AriaTimeField,
  type TimeFieldProps as AriaTimeFieldProps,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import { dateSegments, fieldGroup, segment } from '../DatePicker/DatePicker.css.js';
import { controlSize, controlWrapperBase, controlWrapperVariant } from '../shared/control.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';

export interface TimePickerOwnProps {
  label?: ReactNode;
  size?: FormControlSize;
  variant?: FormControlVariant;
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
}

type NativeTimePickerProps<T extends TimeValue> = Omit<
  AriaTimeFieldProps<T>,
  'className' | 'style' | 'children'
>;

export type TimePickerProps<T extends TimeValue = TimeValue> = TimePickerOwnProps &
  NativeTimePickerProps<T>;

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  function TimePicker(props, ref) {
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
      <AriaTimeField
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
            <AriaDateInput className={dateSegments}>
              {(seg) => <AriaDateSegment segment={seg} className={segment} />}
            </AriaDateInput>
          </div>
        </AriaGroup>
      </AriaTimeField>
    );
  },
);
