import * as RadixCheckbox from '@radix-ui/react-checkbox';
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

export type CheckboxColorScheme = keyof typeof checkboxColorScheme;
export type CheckboxState = boolean | 'indeterminate';

export interface CheckboxProps extends BooleanFormControlBase {
  /**
   * Group value — only used when this `<Checkbox>` is a child of
   * `<CheckboxGroup>`. Mutually exclusive with `checked`/`onCheckedChange`.
   */
  value?: string;
  checked?: CheckboxState;
  defaultChecked?: CheckboxState;
  onCheckedChange?: (checked: CheckboxState) => void;
  /** Forces the visual indeterminate state. Equivalent to `checked="indeterminate"`. */
  indeterminate?: boolean;
  colorScheme?: CheckboxColorScheme;
  children?: ReactNode;
  className?: string;
}

const CheckIcon = (): React.ReactElement => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 8l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IndeterminateIcon = (): React.ReactElement => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

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
        {checked === 'indeterminate' ? <IndeterminateIcon /> : <CheckIcon />}
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
