import * as RadixSwitch from '@radix-ui/react-switch';
import { Check, Loader2 } from 'lucide-react';
import { type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import type { BooleanFormControlBase } from '../shared/types.js';
import {
  switchLabel,
  switchRoot,
  switchSize,
  switchThumb,
  thumbCheck,
  thumbCheckInvalid,
  thumbLoader,
} from './Switch.css.js';

/** Props for `<Switch>`. Built on `@radix-ui/react-switch`. */
export interface SwitchProps extends BooleanFormControlBase {
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Fires with the next checked state on toggle. */
  onCheckedChange?: (checked: boolean) => void;
  /** Submitted value when checked. */
  value?: string;
  /**
   * Renders a spinner inside the thumb and blocks interaction while
   * awaiting async work.
   * @default false
   */
  loading?: boolean;
  /** Optional label rendered alongside the control. */
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
    loading = false,
    children,
    className,
  } = props;

  const showIcon = size !== 'sm';
  const iconPx = size === 'lg' ? 14 : 12;
  const effectiveDisabled = disabled || loading;

  const control = (
    <RadixSwitch.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={effectiveDisabled}
      required={required}
      name={name}
      id={id}
      value={value}
      autoFocus={autoFocus}
      aria-busy={loading || undefined}
      data-invalid={invalid || undefined}
      data-loading={loading || undefined}
      className={cn(switchRoot, switchSize[size], children ? undefined : className)}
    >
      <RadixSwitch.Thumb className={switchThumb}>
        {loading ? (
          <Loader2 className={thumbLoader} size={iconPx} aria-hidden="true" />
        ) : showIcon ? (
          <Check
            className={cn(thumbCheck, invalid && thumbCheckInvalid)}
            size={iconPx}
            strokeWidth={3}
            aria-hidden="true"
          />
        ) : null}
      </RadixSwitch.Thumb>
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
