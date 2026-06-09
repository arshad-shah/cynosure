import { Minus, Plus } from 'lucide-react';
import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  forwardRef,
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
  numberInputField,
  numberInputFieldSize,
  numberInputInput,
  numberInputSegmentSize,
  numberInputStepButton,
  numberInputStepButtonSize,
  numberInputTrack,
  numberInputTrackSize,
  numberInputTrackVariant,
  numberInputValueSegment,
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
   * Visual treatment. Tints the track; the segmented layout is constant.
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
   * otherwise empty. Pointer-only; distinct from the −/+ hold-to-repeat.
   * @default false
   */
  clearOnLongPress?: boolean;
}

export type NumberInputProps = NumberInputOwnProps;

const ICON_SIZE: Record<FormControlSize, number> = { sm: 14, md: 16, lg: 18 };

const LONG_PRESS_MS = 500;

/**
 * Numeric input rendered as a segmented control — `[ − ][ value ][ + ]` —
 * inside a tinted track. Delegates to React Aria's `NumberField` for
 * locale-correct parsing, formatting/clamping, mobile `inputMode`, keyboard
 * support (↑/↓, page up/down, home/end, wheel), and continuous press-and-hold
 * stepping on the −/+ buttons. We own the visuals: the track carries the focus
 * ring and state styling so it matches the rest of the form controls.
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
      clearOnLongPress = false,
      isDisabled,
      isReadOnly,
      isInvalid,
      ...rest
    } = props;

    const invalidFlag = invalid ?? isInvalid;

    return (
      <NumberField
        {...rest}
        ref={ref}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isInvalid={invalidFlag}
      >
        <NumberInputControl
          size={size}
          variant={variant}
          invalid={invalidFlag}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          className={className}
          style={style}
          prefix={prefix}
          suffix={suffix}
          incrementLabel={incrementLabel}
          decrementLabel={decrementLabel}
          clearOnLongPress={clearOnLongPress}
        />
      </NumberField>
    );
  },
);

interface NumberInputControlProps {
  size: FormControlSize;
  variant: FormControlVariant;
  invalid: boolean | undefined;
  isDisabled: boolean | undefined;
  isReadOnly: boolean | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  prefix: ReactNode;
  suffix: ReactNode;
  incrementLabel: string | undefined;
  decrementLabel: string | undefined;
  clearOnLongPress: boolean;
}

/**
 * Inner control rendered inside `NumberField` so it can read the field state
 * from context (used by `clearOnLongPress`). Lives separately from the public
 * `NumberInput` because hooks can't run above the `NumberField` provider.
 */
function NumberInputControl(props: NumberInputControlProps): ReactElement {
  const {
    size,
    variant,
    invalid,
    isDisabled,
    isReadOnly,
    className,
    style,
    prefix,
    suffix,
    incrementLabel,
    decrementLabel,
    clearOnLongPress,
  } = props;

  const state = useContext(NumberFieldStateContext);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trackClass = cn(
    numberInputTrack,
    numberInputTrackVariant[variant],
    numberInputTrackSize[size],
    className,
  );
  const stepButtonClass = cn(
    numberInputStepButton,
    numberInputSegmentSize[size],
    numberInputStepButtonSize[size],
  );
  const valueSegmentClass = cn(numberInputValueSegment, numberInputSegmentSize[size]);
  const iconSize = ICON_SIZE[size];

  const longPressEnabled = clearOnLongPress && !isDisabled && !isReadOnly && state != null;

  const cancelLongPress = (): void => {
    if (longPressTimer.current != null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!longPressEnabled || event.button !== 0) return;
    cancelLongPress();
    longPressTimer.current = setTimeout(() => {
      // Clear to the configured floor: `minValue` if one is set, else empty.
      if (state != null && state.minValue !== undefined) {
        state.decrementToMin();
      } else {
        state?.commit('');
      }
    }, LONG_PRESS_MS);
  };

  return (
    <AriaGroup
      className={trackClass}
      data-variant={variant}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-invalid={invalid || undefined}
      style={style}
    >
      <AriaButton
        slot="decrement"
        aria-label={decrementLabel ?? 'Decrement'}
        className={stepButtonClass}
      >
        <Minus size={iconSize} strokeWidth={2.4} aria-hidden />
      </AriaButton>
      <div
        className={valueSegmentClass}
        onPointerDown={longPressEnabled ? startLongPress : undefined}
        onPointerUp={longPressEnabled ? cancelLongPress : undefined}
        onPointerLeave={longPressEnabled ? cancelLongPress : undefined}
        onPointerCancel={longPressEnabled ? cancelLongPress : undefined}
      >
        <div className={cn(numberInputField, numberInputFieldSize[size])}>
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
      </div>
      <AriaButton
        slot="increment"
        aria-label={incrementLabel ?? 'Increment'}
        className={stepButtonClass}
      >
        <Plus size={iconSize} strokeWidth={2.4} aria-hidden />
      </AriaButton>
    </AriaGroup>
  );
}
