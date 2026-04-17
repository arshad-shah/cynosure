import * as RadixRadio from '@radix-ui/react-radio-group';
import { type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { radioGroupHorizontal, radioGroupRoot } from '../Radio/Radio.css.js';

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  /** Layout direction. Defaults to `vertical`. */
  orientation?: 'horizontal' | 'vertical';
  /** `aria-label` for the group when no visible label is provided. */
  'aria-label'?: string;
  /** `aria-labelledby` — typically the id of a companion `<Label>`. */
  'aria-labelledby'?: string;
  id?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Single-select radio group. Owns the selected value and manages
 * roving-tabindex via `@radix-ui/react-radio-group`. Children must be
 * `<Radio value="...">`.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { orientation = 'vertical', className, children, ...rest },
  ref,
) {
  return (
    <RadixRadio.Root
      ref={ref}
      orientation={orientation}
      className={cn(
        radioGroupRoot,
        orientation === 'horizontal' ? radioGroupHorizontal : undefined,
        className,
      )}
      {...rest}
    >
      {children}
    </RadixRadio.Root>
  );
});
