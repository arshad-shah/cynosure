import {
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { cn } from '../../utils/cn.js';
import { IconButton } from '../IconButton/IconButton.js';
import { inputAffordance } from '../shared/affordance.css.js';
import {
  controlAddonLeft,
  controlAddonRight,
  controlElement,
  controlField,
  controlSize,
  controlWrapperBase,
  controlWrapperVariant,
} from '../shared/control.css.js';
import type { FormControlBase } from '../shared/types.js';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

export interface InputOwnProps extends FormControlBase<string> {
  type?: InputType;
  /** Visually joined block on the left (e.g. `"https://"`). */
  leftAddon?: ReactNode;
  /** Visually joined block on the right (e.g. `".com"`). */
  rightAddon?: ReactNode;
  /** Content rendered inside the input on the left (e.g. a search icon). */
  leftElement?: ReactNode;
  /** Content rendered inside the input on the right (e.g. a clear button). */
  rightElement?: ReactNode;
  /** When `true` and value is non-empty, show a clear (×) button. */
  clearable?: boolean;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}

export type InputProps = InputOwnProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'type'
  >;

/** Tiny inline icons — avoid `@arshad-shah/cynosure-icons` until that package exists. */
const EyeIcon = (): React.ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const EyeOffIcon = (): React.ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a20.9 20.9 0 0 1 5.17-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a20.93 20.93 0 0 1-3.16 4.19M1 1l22 22"
    />
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.12 14.12A3 3 0 1 1 9.88 9.88"
    />
  </svg>
);
const XIcon = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const {
    id: idProp,
    value: valueProp,
    defaultValue,
    onChange,
    type: typeProp = 'text',
    disabled,
    readOnly,
    required,
    invalid,
    size = 'md',
    variant = 'outline',
    leftAddon,
    rightAddon,
    leftElement,
    rightElement,
    clearable,
    className,
    style,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const fallbackId = useId();
  const id = idProp ?? fallbackId;

  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange,
  });

  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const type = typeProp === 'password' && passwordVisible ? 'text' : (typeProp as InputType);

  const inputNodeRef = useRef<HTMLInputElement | null>(null);
  const mergedRef = useMergedRef(ref, inputNodeRef);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    [setValue],
  );

  const handleClear = useCallback(() => {
    setValue('');
    inputNodeRef.current?.focus();
  }, [setValue]);

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const showPasswordToggle = typeProp === 'password' && rightElement === undefined;
  const showClearButton = clearable && value !== '' && !disabled && !readOnly;

  const resolvedRightElement =
    rightElement ??
    (showClearButton ? (
      <IconButton
        variant="bare"
        label="Clear input"
        icon={<XIcon />}
        className={inputAffordance}
        onClick={handleClear}
      />
    ) : showPasswordToggle ? (
      <IconButton
        variant="bare"
        label={passwordVisible ? 'Hide password' : 'Show password'}
        icon={passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
        className={inputAffordance}
        aria-pressed={passwordVisible}
        onClick={() => setPasswordVisible((v) => !v)}
      />
    ) : null);

  const wrapperClass = cn(
    controlWrapperBase,
    controlWrapperVariant[variant],
    controlSize[size],
    className,
  );

  return (
    <div
      className={wrapperClass}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={invalid || undefined}
      data-focus-within={focused || undefined}
      data-hover={hover || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
    >
      {leftAddon ? <span className={controlAddonLeft}>{leftAddon}</span> : null}
      {leftElement ? <span className={controlElement}>{leftElement}</span> : null}
      <input
        id={id}
        ref={mergedRef}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        aria-invalid={invalid || undefined}
        className={controlField}
        {...rest}
      />
      {resolvedRightElement ? <span className={controlElement}>{resolvedRightElement}</span> : null}
      {rightAddon ? <span className={controlAddonRight}>{rightAddon}</span> : null}
    </div>
  );
});
