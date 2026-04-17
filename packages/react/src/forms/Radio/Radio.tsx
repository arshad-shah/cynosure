import * as RadixRadio from '@radix-ui/react-radio-group';
import { type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import type { FormControlSize } from '../shared/types.js';
import { radioIndicator, radioLabel, radioRoot, radioSize } from './Radio.css.js';

export interface RadioProps {
  value: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  size?: FormControlSize;
  invalid?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * Single radio button — must be a descendant of `<RadioGroup>` so that Radix
 * can manage roving-tabindex and selection. Pass `children` to render a label
 * wrapping the control.
 */
export const Radio = forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { value, disabled, required, id, size = 'md', invalid, children, className },
  ref,
) {
  const control = (
    <RadixRadio.Item
      ref={ref}
      value={value}
      disabled={disabled}
      required={required}
      id={id}
      data-invalid={invalid || undefined}
      className={cn(radioRoot, radioSize[size], children ? undefined : className)}
    >
      <RadixRadio.Indicator className={radioIndicator} />
    </RadixRadio.Item>
  );

  if (children === undefined) return control;

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: `control` renders a Radix radio item as a direct child.
    <label className={cn(radioLabel, className)} data-disabled={disabled || undefined}>
      {control}
      <span>{children}</span>
    </label>
  );
});
