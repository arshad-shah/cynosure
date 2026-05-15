import { Check, Minus } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, forwardRef, useContext } from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import { CheckboxGroupContext } from '../CheckboxGroup/context.js';
import type { BooleanFormControlBase } from '../shared/types.js';
import {
  checkboxColorScheme,
  checkboxIndicator,
  checkboxLabel,
  checkboxRoot,
  checkboxSize,
} from './Checkbox.css.js';

// Held in a constant so biome's `useSemanticElements` doesn't suggest
// rewriting to `<input type="checkbox">` — Radix's tri-state pattern relies
// on the indeterminate ("mixed") state which a native input doesn't expose
// stably across browsers; consumer CSS already targets the button.
const CHECKBOX_ROLE = 'checkbox';

const INDICATOR_SIZE_PX: Record<'sm' | 'md' | 'lg', number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export type CheckboxColorScheme = 'accent' | 'success' | 'danger' | 'neutral';
export type CheckboxState = boolean | 'indeterminate';

/** Props for `<Checkbox>`. */
export interface CheckboxProps extends BooleanFormControlBase {
  /**
   * Group value — only used when this `<Checkbox>` is a child of
   * `<CheckboxGroup>`. Mutually exclusive with `checked`/`onCheckedChange`.
   */
  value?: string;
  /** Controlled checked state. `"indeterminate"` shows a dash glyph. */
  checked?: CheckboxState;
  /** Uncontrolled initial checked state. */
  defaultChecked?: CheckboxState;
  /** Fires with the next checked state on user toggle. */
  onCheckedChange?: (checked: CheckboxState) => void;
  /** Forces the visual indeterminate state. Equivalent to `checked="indeterminate"`. */
  indeterminate?: boolean;
  /**
   * Colour palette for the checked state.
   * @default "accent"
   */
  colorScheme?: CheckboxColorScheme;
  /** Optional label content — when provided, the checkbox renders inside a `<label>`. */
  children?: ReactNode;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * Tri-state boolean control: unchecked, checked, or indeterminate.
 *
 * Renders a `role="checkbox"` button (no native input — Radix's approach,
 * which gives the indeterminate visual a stable styling target) plus a
 * hidden `<input type="checkbox">` for form submission when `name` is set.
 * Space toggles the visible button.
 *
 * - Inside `<CheckboxGroup>`, the `value` prop is the identifier and
 *   parent-level state replaces `checked`.
 * - Pass `children` to render an inline label tied to the same `<label>`.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(props, ref) {
  const group = useContext(CheckboxGroupContext);

  const {
    size = 'md',
    colorScheme = 'accent',
    indeterminate,
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    disabled: disabledProp,
    required,
    invalid,
    name,
    id,
    value,
    autoFocus,
    children,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
  } = props;

  const inGroup = group !== undefined && value !== undefined;

  const [uncontrolledChecked, setUncontrolledChecked] = useControllableState<CheckboxState>({
    value: inGroup ? undefined : (checkedProp as CheckboxState | undefined),
    defaultValue: defaultChecked ?? false,
    onChange: inGroup ? undefined : onCheckedChange,
  });

  const checked: CheckboxState = indeterminate
    ? 'indeterminate'
    : inGroup
      ? (group?.value.includes(value as string) ?? false)
      : uncontrolledChecked;

  const disabled = disabledProp ?? group?.disabled;
  const state = checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked';

  const toggle = () => {
    if (disabled) return;
    // Indeterminate transitions to checked, mirroring Radix and the native
    // `<input>` behaviour.
    const next: CheckboxState = checked === 'indeterminate' ? true : !checked;
    if (inGroup) {
      group?.onItemChange(value as string, next === true);
    } else {
      setUncontrolledChecked(next);
    }
  };

  const onClick = () => toggle();
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  };

  const submissionName = name ?? group?.name;
  const control = (
    <button
      ref={ref}
      type="button"
      role={CHECKBOX_ROLE}
      aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
      aria-required={required || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      data-state={state}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      disabled={disabled}
      id={id}
      // biome-ignore lint/a11y/noAutofocus: parity with Radix — consumers opt in explicitly.
      autoFocus={autoFocus}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        checkboxRoot,
        checkboxSize[size],
        checkboxColorScheme[colorScheme],
        children ? undefined : className,
      )}
    >
      {checked ? (
        <span className={checkboxIndicator} data-state={state}>
          {checked === 'indeterminate' ? (
            <Minus size={INDICATOR_SIZE_PX[size]} strokeWidth={3.5} aria-hidden />
          ) : (
            <Check size={INDICATOR_SIZE_PX[size]} strokeWidth={3.5} aria-hidden />
          )}
        </span>
      ) : null}
      {submissionName ? (
        <input
          type="checkbox"
          name={submissionName}
          value={value}
          checked={checked === true}
          required={required}
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
          // Native form submission only; the visible button drives all
          // user interaction. The onChange silences React's controlled-
          // input warning.
          onChange={() => {}}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            opacity: 0,
            margin: 0,
            width: 0,
            height: 0,
          }}
        />
      ) : null}
    </button>
  );

  if (children === undefined) return control;

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: `control` renders the checkbox button as a direct child.
    <label className={cn(checkboxLabel, className)} data-disabled={disabled || undefined}>
      {control}
      <span>{children}</span>
    </label>
  );
});
