import { type FormHTMLAttributes, forwardRef } from 'react';

/** Props for `<Form>`. Extends every native `<form>` attribute. */
export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /**
   * Skip native HTML validation bubbles. Cynosure renders its own validation
   * messages via `FormMessage`, so the native bubbles usually conflict with
   * our UI. Set to `false` if you specifically want the browser's UI.
   * @default true
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
