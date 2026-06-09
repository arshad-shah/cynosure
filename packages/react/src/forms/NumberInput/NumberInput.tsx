import { Minus, Plus } from 'lucide-react';
import {
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  forwardRef,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
  NumberField,
  type NumberFieldProps,
  NumberFieldStateContext,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import {
  numberInputAffix,
  numberInputInput,
  numberInputStepper,
  numberInputStepperSize,
  numberInputTrack,
  numberInputTrackSize,
  numberInputTrackVariant,
  numberInputValue,
  numberInputValueSize,
} from './NumberInput.css.js';

type BaseNumberFieldProps = Omit<NumberFieldProps, 'className' | 'style' | 'children'>;

/** Cynosure-specific props for `<NumberInput>`. Extends React Aria's `NumberFieldProps` for parsing/formatting. */
export interface NumberInputOwnProps extends BaseNumberFieldProps {
  /**
   * Control size.
   * @default "md"
   */
  size?: FormControlSize;
  /**
   * Visual treatment. Tints the segmented track; the `− / value / +`
   * structure is constant.
   * @default "outline"
   */
  variant?: FormControlVariant;
  /** Mirrors React Aria's `isInvalid` for parity with other Cynosure controls. */
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Muted inline content before the value (e.g. `$`, `€`, `#`). */
  prefix?: ReactNode;
  /** Muted inline content after the value (e.g. `px`, `%`, `kg`). */
  suffix?: ReactNode;
  /** Custom `aria-label` for the increment button. Overrides the localized default. */
  incrementLabel?: string;
  /** Custom `aria-label` for the decrement button. Overrides the localized default. */
  decrementLabel?: string;
  /**
   * Long-press the value segment (~500ms) to clear it — to `minValue` if set,
   * otherwise empty. Opt-in so an accidental hold never wipes a value.
   * @default false
   */
  clearOnLongPress?: boolean;
}

export type NumberInputProps = NumberInputOwnProps;

const ICON_SIZE: Record<FormControlSize, number> = { sm: 14, md: 16, lg: 18 };

const LONG_PRESS_MS = 500;

/**
 * The editable middle segment. Pulled into its own component so it can read the
 * `NumberFieldStateContext` for the opt-in long-press-to-clear gesture, which
 * needs the live state to reset the value.
 */
function NumberInputValueSegment({
  className,
  prefix,
  suffix,
  clearOnLongPress,
}: {
  className: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearOnLongPress?: boolean;
}): React.ReactElement {
  const state = useContext(NumberFieldStateContext);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (!clearOnLongPress || !state) return;
      // Ignore secondary mouse buttons; let normal text interaction proceed.
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      cancel();
      timer.current = setTimeout(() => {
        if (state.minValue !== undefined) {
          state.setNumberValue(state.minValue);
        } else {
          state.setInputValue('');
          state.commit('');
        }
      }, LONG_PRESS_MS);
    },
    [clearOnLongPress, state, cancel],
  );

  return (
    <div
      className={className}
      onPointerDown={clearOnLongPress ? onPointerDown : undefined}
      onPointerUp={clearOnLongPress ? cancel : undefined}
      onPointerLeave={clearOnLongPress ? cancel : undefined}
      onPointerCancel={clearOnLongPress ? cancel : undefined}
    >
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
  );
}

/**
 * Numeric input rendered as a segmented `[ − ][ value ][ + ]` control inside a
 * tinted track. Delegates to React Aria's `NumberField` for locale-correct
 * parsing, keyboard support (↑/↓, page up/down, home/end), wheel handling, and
 * built-in press-and-hold repeat on the stepper buttons (with acceleration and
 * a touch-aware initial delay). `variant` tints the track; the segmented
 * structure stays constant. The track owns the focus ring so it surrounds the
 * whole control.
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
      clearOnLongPress,
      isDisabled,
      isReadOnly,
      isInvalid,
      ...rest
    } = props;

    const invalidFlag = invalid ?? isInvalid;
    const trackClass = cn(
      numberInputTrack,
      numberInputTrackVariant[variant],
      numberInputTrackSize[size],
      className,
    );
    const stepperClass = cn(numberInputStepper, numberInputStepperSize[size]);
    const valueClass = cn(numberInputValue, numberInputValueSize[size]);
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
          className={trackClass}
          data-variant={variant}
          data-disabled={isDisabled || undefined}
          data-readonly={isReadOnly || undefined}
          data-invalid={invalidFlag || undefined}
          style={style}
        >
          <AriaButton
            slot="decrement"
            aria-label={decrementLabel ?? 'Decrement'}
            className={stepperClass}
          >
            <Minus size={iconSize} strokeWidth={2.4} aria-hidden />
          </AriaButton>
          <NumberInputValueSegment
            className={valueClass}
            prefix={prefix}
            suffix={suffix}
            clearOnLongPress={clearOnLongPress}
          />
          <AriaButton
            slot="increment"
            aria-label={incrementLabel ?? 'Increment'}
            className={stepperClass}
          >
            <Plus size={iconSize} strokeWidth={2.4} aria-hidden />
          </AriaButton>
        </AriaGroup>
      </NumberField>
    );
  },
);
