import { type FormHTMLAttributes, forwardRef } from 'react';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /**
   * Defaults to `true` — Cynosure renders its own validation messages via
   * `FormMessage`, so the native browser bubbles conflict with our UI. Pass
   * `noValidate={false}` if you specifically want the browser's validation UI.
   */
  noValidate?: boolean;
}

/**
 * Form root. Thin wrapper over `<form>` that flips `noValidate` on by default
 * so browser-native validation bubbles don't fight `FormMessage`. Provides no
 * context itself — state libraries (react-hook-form, Formik, etc.) own that.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { noValidate = true, ...rest },
  ref,
) {
  return <form ref={ref} noValidate={noValidate} {...rest} />;
});
