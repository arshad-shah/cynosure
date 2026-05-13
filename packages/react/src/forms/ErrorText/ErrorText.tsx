import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { errorText } from './ErrorText.css.js';

/** Props for `<ErrorText>` — accepts every native `<p>` attribute. `role` defaults to `"alert"`. */
export interface ErrorTextProps extends HTMLAttributes<HTMLParagraphElement> {}

/**
 * Inline error message for a form control. Announces to assistive tech via
 * `role="alert"` so its appearance is read out the moment the field becomes
 * invalid. Reference via `aria-describedby` on the associated input.
 */
export const ErrorText = forwardRef<HTMLParagraphElement, ErrorTextProps>(function ErrorText(
  { className, role = 'alert', ...rest },
  ref,
) {
  return <p ref={ref} className={cn(errorText, className)} role={role} {...rest} />;
});
