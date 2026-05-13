import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { type ReactNode, forwardRef, useContext } from 'react';
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

const INDICATOR_SIZE_PX: Record<'sm' | 'md' | 'lg', number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export type CheckboxColorScheme = keyof typeof checkboxColorScheme;
export type CheckboxState = boolean | 'indeterminate';

/** Props for `<Checkbox>`. Built on `@radix-ui/react-checkbox`. */
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
 * `Checkbox` is a tri-state boolean control: unchecked, checked, or indeterminate.
 *
 * - Wraps `@radix-ui/react-checkbox` for ARIA semantics and keyboard support.
 * - Inside `<CheckboxGroup>`, the `value` prop is used and parent-level state replaces `checked`.
 * - Pass `children` to render an inline label tied to the same `<label>`.
 *
 * Fully keyboard accessible (Space toggles).
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
  const checked: CheckboxState = indeterminate
    ? 'indeterminate'
    : inGroup
      ? (group?.value.includes(value as string) ?? false)
      : (checkedProp as CheckboxState);
  const disabled = disabledProp ?? group?.disabled;

  const handleChange = (next: CheckboxState): void => {
    if (inGroup) {
      group?.onItemChange(value as string, next === true);
    } else {
      onCheckedChange?.(next);
    }
  };

  const control = (
    <RadixCheckbox.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleChange}
      disabled={disabled}
      required={required}
      name={name ?? group?.name}
      id={id}
      value={value}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        checkboxRoot,
        checkboxSize[size],
        checkboxColorScheme[colorScheme],
        children ? undefined : className,
      )}
    >
      <RadixCheckbox.Indicator className={checkboxIndicator}>
        {checked === 'indeterminate' ? (
          <Minus size={INDICATOR_SIZE_PX[size]} strokeWidth={3.5} aria-hidden />
        ) : (
          <Check size={INDICATOR_SIZE_PX[size]} strokeWidth={3.5} aria-hidden />
        )}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );

  if (children === undefined) {
    return control;
  }

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: `control` renders a Radix checkbox root as a direct child.
    <label className={cn(checkboxLabel, className)} data-disabled={disabled || undefined}>
      {control}
      <span>{children}</span>
    </label>
  );
});
