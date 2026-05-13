import * as RadixRadio from '@radix-ui/react-radio-group';
import { type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { radioGroupHorizontal, radioGroupRoot } from '../Radio/Radio.css.js';

/** Props for `<RadioGroup>` — single-select radio container. */
export interface RadioGroupProps {
  /** Controlled selected radio value. */
  value?: string;
  /** Uncontrolled initial selected value. */
  defaultValue?: string;
  /** Fires with the next value on selection change. */
  onValueChange?: (value: string) => void;
  /** Submitted form field name shared across every radio in the group. */
  name?: string;
  /** Disables every radio in the group. */
  disabled?: boolean;
  /** Marks the field as required for form submission. */
  required?: boolean;
  /**
   * Layout direction. Affects arrow-key navigation.
   * @default "vertical"
   */
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
