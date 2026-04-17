import { type CSSProperties, forwardRef } from 'react';
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
import { numberInputField, numberInputStepper, numberInputSteppers } from './NumberInput.css.js';

type BaseNumberFieldProps = Omit<NumberFieldProps, 'className' | 'style' | 'children'>;

export interface NumberInputOwnProps extends BaseNumberFieldProps {
  size?: FormControlSize;
  variant?: FormControlVariant;
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Custom labels override the localized "Increment"/"Decrement" strings. */
  incrementLabel?: string;
  decrementLabel?: string;
}

export type NumberInputProps = NumberInputOwnProps;

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
      className,
    );

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
          <AriaInput className={numberInputField} />
          <div className={numberInputSteppers} aria-hidden="true">
            <AriaButton
              slot="increment"
              aria-label={incrementLabel ?? 'Increment'}
              className={numberInputStepper}
            >
              ▲
            </AriaButton>
            <AriaButton
              slot="decrement"
              aria-label={decrementLabel ?? 'Decrement'}
              className={numberInputStepper}
            >
              ▼
            </AriaButton>
          </div>
        </AriaGroup>
      </NumberField>
    );
  },
);
