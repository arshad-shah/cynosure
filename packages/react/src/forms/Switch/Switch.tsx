import * as RadixSwitch from '@radix-ui/react-switch';
import { type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import type { BooleanFormControlBase } from '../shared/types.js';
import { switchLabel, switchRoot, switchSize, switchThumb } from './Switch.css.js';

export interface SwitchProps extends BooleanFormControlBase {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  value?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Toggle switch. Semantically conveys an "on/off setting that takes effect
 * immediately" — prefer over `<Checkbox>` when the action has no explicit
 * Save button. Pass `children` to render the label alongside.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(props, ref) {
  const {
    size = 'md',
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
    required,
    invalid,
    name,
    id,
    value,
    autoFocus,
    children,
    className,
  } = props;

  const control = (
    <RadixSwitch.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
      value={value}
      autoFocus={autoFocus}
      data-invalid={invalid || undefined}
      className={cn(switchRoot, switchSize[size], children ? undefined : className)}
    >
      <RadixSwitch.Thumb className={switchThumb} />
    </RadixSwitch.Root>
  );

  if (children === undefined) return control;

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: `control` renders a Radix switch root as a direct child.
    <label className={cn(switchLabel, className)} data-disabled={disabled || undefined}>
      {control}
      <span>{children}</span>
    </label>
  );
});
