import { ChevronDown, ChevronUp } from 'lucide-react';
import { type CSSProperties, type ReactNode, forwardRef } from 'react';
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
  NumberField,
  type NumberFieldProps,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import { controlSize, controlWrapperBase, controlWrapperVariant } from '../shared/control.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import {
  numberInputAffix,
  numberInputField,
  numberInputInput,
  numberInputStepper,
  numberInputStepperSize,
  numberInputSteppers,
  numberInputSteppersSize,
  numberInputWrapper,
} from './NumberInput.css.js';

type BaseNumberFieldProps = Omit<NumberFieldProps, 'className' | 'style' | 'children'>;

export interface NumberInputOwnProps extends BaseNumberFieldProps {
  size?: FormControlSize;
  variant?: FormControlVariant;
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Muted inline content before the value (e.g. `$`, `€`, `#`). */
  prefix?: ReactNode;
  /** Muted inline content after the value (e.g. `px`, `%`, `kg`). */
  suffix?: ReactNode;
  /** Custom labels override the localized "Increment"/"Decrement" strings. */
  incrementLabel?: string;
  decrementLabel?: string;
}

export type NumberInputProps = NumberInputOwnProps;

const ICON_SIZE: Record<FormControlSize, number> = { sm: 11, md: 12, lg: 14 };

/**
 * Numeric input with stepper buttons. Delegates to React Aria's `NumberField`
 * for locale-correct parsing, keyboard support (↑/↓, page up/down, home/end),
 * and wheel/scroll handling. We own the visuals: the group reuses the shared
 * `controlWrapper*` recipe so focus/invalid/disabled states match `<Input>`.
 */
export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberInput(props, ref) {
    const {
      size = 'md',
      variant = 'outline',
      invalid,
      className,
      style,
      prefix,
      suffix,
      incrementLabel,
      decrementLabel,
      isDisabled,
      isReadOnly,
      isInvalid,
      ...rest
    } = props;

    const invalidFlag = invalid ?? isInvalid;
    const wrapperClass = cn(
      controlWrapperBase,
      controlWrapperVariant[variant],
      controlSize[size],
      numberInputWrapper,
      className,
    );
    const stepperClass = cn(numberInputStepper, numberInputStepperSize[size]);
    const steppersClass = cn(numberInputSteppers, numberInputSteppersSize[size]);
    const iconSize = ICON_SIZE[size];

    return (
      <NumberField
        {...rest}
        ref={ref}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isInvalid={invalidFlag}
      >
        <AriaGroup
          className={wrapperClass}
          data-disabled={isDisabled || undefined}
          data-readonly={isReadOnly || undefined}
          data-invalid={invalidFlag || undefined}
          style={style}
        >
          <div className={numberInputField}>
            {prefix !== undefined && prefix !== null ? (
              <span className={numberInputAffix} aria-hidden="true">
                {prefix}
              </span>
            ) : null}
            <AriaInput className={numberInputInput} />
            {suffix !== undefined && suffix !== null ? (
              <span className={numberInputAffix} aria-hidden="true">
                {suffix}
              </span>
            ) : null}
          </div>
          <div className={steppersClass} aria-hidden="true">
            <AriaButton
              slot="increment"
              aria-label={incrementLabel ?? 'Increment'}
              className={stepperClass}
            >
              <ChevronUp size={iconSize} strokeWidth={2.4} aria-hidden />
            </AriaButton>
            <AriaButton
              slot="decrement"
              aria-label={decrementLabel ?? 'Decrement'}
              className={stepperClass}
            >
              <ChevronDown size={iconSize} strokeWidth={2.4} aria-hidden />
            </AriaButton>
          </div>
        </AriaGroup>
      </NumberField>
    );
  },
);
