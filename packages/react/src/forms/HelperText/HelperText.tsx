import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { helperText } from './HelperText.css.js';

export interface HelperTextProps extends HTMLAttributes<HTMLParagraphElement> {}

/**
 * Subtle, small-sized companion text for a form control (e.g. "We'll never
 * share your email"). Reference via `aria-describedby` on the input.
 */
export const HelperText = forwardRef<HTMLParagraphElement, HelperTextProps>(function HelperText(
  { className, ...rest },
  ref,
) {
  return <p ref={ref} className={cn(helperText, className)} {...rest} />;
});
