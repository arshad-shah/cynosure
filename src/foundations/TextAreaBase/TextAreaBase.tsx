import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextAreaBaseProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Maps to aria-invalid. */
  invalid?: boolean;
}

/** Foundation: the only place Cynosure renders a native <textarea>. */
export const TextAreaBase = forwardRef<HTMLTextAreaElement, TextAreaBaseProps>(function TextAreaBase(
  { invalid, ...rest },
  ref,
) {
  return <textarea ref={ref} aria-invalid={invalid || undefined} {...rest} />;
});
