import { LucideEye, LucideEyeOff, X } from 'lucide-react';
import {
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  isValidElement,
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
  controlElement,
  controlField,
  controlSize,
  controlWrapperBase,
  controlWrapperVariant,
} from '../shared/control.css.js';
import type { FormControlBase, FormControlSize } from '../shared/types.js';
import {
  actionWell,
  fieldWell,
  inertWell,
  inputElement,
  multiWellRoot,
  slotGroup,
  wellSize,
} from './Input.css.js';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

/** Local variant union — adds `'flat'` (legacy single-well escape hatch) to the shared FormControlVariant. */
export type InputVariant = 'outline' | 'filled' | 'ghost' | 'flat';

export interface InputOwnProps extends Omit<FormControlBase<string>, 'variant'> {
  type?: InputType;
  variant?: InputVariant;
  /** Single node or array. Strings/icons render as inert wells; buttons/onClick render as action wells. */
  leadingSlot?: ReactNode | ReactNode[];
  /** Single node or array. Same rules as leadingSlot. */
  trailingSlot?: ReactNode | ReactNode[];
  /** When true and value is non-empty, appends a clear × as a trailing action well. */
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

/** Normalize a slot prop into an array, dropping nullish/false entries. */
function toArray(slot: ReactNode | ReactNode[] | undefined): ReactNode[] {
  if (slot == null) return [];
  return (Array.isArray(slot) ? slot : [slot]).filter((n) => n != null && n !== false);
}

/**
 * Classify a slot child. Action wells get accent-tinted hover and a focus
 * ring; inert wells are pointer-events: none decoration.
 *
 *  - <button>         → action
 *  - role="button"    → action
 *  - has onClick prop → action
 *  - anything else    → inert
 */
function isActionNode(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  const el = node as ReactElement<{ role?: unknown; onClick?: unknown }>;
  if (typeof el.type === 'string' && el.type === 'button') return true;
  const props = el.props ?? {};
  if (props.role === 'button') return true;
  if (typeof props.onClick === 'function') return true;
  return false;
}

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
    leadingSlot,
    trailingSlot,
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
    (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
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

  // Auto-appended trailing affordances.
  const showPasswordToggle = typeProp === 'password';
  const showClearButton = clearable && value !== '' && !disabled && !readOnly;

  const autoTrailing: ReactNode[] = [];
  if (showClearButton) {
    autoTrailing.push(
      <IconButton
        key="__clear"
        variant="bare"
        label="Clear input"
        icon={<X />}
        className={inputAffordance}
        onClick={handleClear}
      />,
    );
  }
  if (showPasswordToggle) {
    autoTrailing.push(
      <IconButton
        key="__password"
        variant="bare"
        label={passwordVisible ? 'Hide password' : 'Show password'}
        icon={passwordVisible ? <LucideEyeOff /> : <LucideEye />}
        className={inputAffordance}
        aria-pressed={passwordVisible}
        onClick={() => setPasswordVisible((v) => !v)}
      />,
    );
  }

  const leading = toArray(leadingSlot);
  const trailing = [...toArray(trailingSlot), ...autoTrailing];

  // ---- `variant="flat"`: today's single-well layout; slots render inline. ----

  if (variant === 'flat') {
    return (
      <div
        className={cn(
          controlWrapperBase,
          controlWrapperVariant.outline,
          controlSize[size],
          className,
        )}
        data-variant="flat"
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-invalid={invalid || undefined}
        data-focus-within={focused || undefined}
        data-hover={hover || undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={style}
      >
        {leading.map((node, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: slot list is a static fixed-arity prop; positional keys are correct
          <span key={`lead-${i}`} className={controlElement}>
            {node}
          </span>
        ))}
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
        {trailing.map((node, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: slot list is a static fixed-arity prop; positional keys are correct
          <span key={`trail-${i}`} className={controlElement}>
            {node}
          </span>
        ))}
      </div>
    );
  }

  // ---- Multi-well (outline / filled / ghost): row of wells with a gap. ----

  const sizeClass = wellSize[size as FormControlSize];

  return (
    <div
      className={cn(multiWellRoot, className)}
      data-variant={variant}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={invalid || undefined}
      data-focus-within={focused || undefined}
      data-hover={hover || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
    >
      {leading.length > 0 ? (
        <span className={slotGroup}>
          {leading.map((node, i) => {
            const action = isActionNode(node);
            return (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: slot list is a static fixed-arity prop; positional keys are correct
                key={`lead-${i}`}
                className={cn(action ? actionWell : inertWell, sizeClass)}
                data-slot-kind={action ? 'action' : 'inert'}
              >
                {node}
              </span>
            );
          })}
        </span>
      ) : null}

      <span className={cn(fieldWell, sizeClass)}>
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
          className={inputElement}
          {...rest}
        />
      </span>

      {trailing.length > 0 ? (
        <span className={slotGroup}>
          {trailing.map((node, i) => {
            const action = isActionNode(node);
            return (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: slot list is a static fixed-arity prop; positional keys are correct
                key={`trail-${i}`}
                className={cn(action ? actionWell : inertWell, sizeClass)}
                data-slot-kind={action ? 'action' : 'inert'}
              >
                {node}
              </span>
            );
          })}
        </span>
      ) : null}
    </div>
  );
});
