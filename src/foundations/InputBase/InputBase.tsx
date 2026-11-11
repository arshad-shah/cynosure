import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputBaseProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Maps to aria-invalid. */
  invalid?: boolean;
}

/** Foundation: the only place Cynosure renders a native text-like <input>. */
export const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(function InputBase(
  { invalid, ...rest },
  ref,
) {
  return <input ref={ref} aria-invalid={invalid || undefined} {...rest} />;
});
