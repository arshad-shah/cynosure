import {
  type CSSProperties,
  type FormEvent,
  type FormHTMLAttributes,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { isComposing } from "../../foundations/keys.js";
import { type Space, space } from "../../foundations/layout.js";

export interface FormTokens {
  /** Space between the form's fields when `gap` is not given. */
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    form: FormTokens;
  }
}

type NativeForm = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "className" | "style" | "children">;

export interface FormProps extends NativeForm {
  /**
   * Called with the form's values when it is submitted (Enter in a field, a `type="submit"` Button) and its fields
   * are valid. The page does not navigate. Leave it out for a native form that posts to `action`.
   */
  onSubmit?: ((values: FormData, event: FormEvent<HTMLFormElement>) => void) | undefined;
  /** Names the form, which makes it a `form` landmark ("Unlock the document"). Or use `aria-labelledby`. */
  label?: string | undefined;
  /** Space token between the fields, stacked in a column. Default `--cy-form-gap` (`--cy-space-4`). */
  gap?: Space | undefined;
  /** Added to the form element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-form-* tokens. */
  style?: CSSProperties;
  /** The fields and buttons. */
  children?: ReactNode;
}

/** Inputs whose Enter is not a submit (a browser never submits from them either). */
const NOT_TEXT = new Set([
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
  "file",
  "image",
  "color",
  "range",
]);

/**
 * A group of fields that submits as one: Enter in any text field submits it (even with several fields and no submit
 * button, where a browser would not), after the fields' own validation, and `onSubmit` gets the values as FormData.
 * Fields stack with a token gap.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { onSubmit, label, gap, onKeyDown, className, style, children, ...rest },
  ref,
) {
  const keyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    onKeyDown?.(event);
    const target = event.target;
    // A field that used Enter itself (adding a tag, picking an option) has prevented it; an IME's Enter is its own.
    if (event.key !== "Enter" || event.defaultPrevented || isComposing(event)) return;
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    if (
      !(target instanceof HTMLInputElement) ||
      NOT_TEXT.has(target.type) ||
      target.form !== event.currentTarget
    )
      return;
    // One way in for every case: the browser's own implicit submission would fire too, and only with a button.
    event.preventDefault();
    event.currentTarget.requestSubmit();
  };
  return (
    <form
      ref={ref}
      aria-label={label}
      {...rest}
      className={`cy-form${className ? ` ${className}` : ""}`}
      style={{ ...(gap ? { "--_gap": space(gap) } : {}), ...style } as CSSProperties}
      onKeyDown={keyDown}
      onSubmit={
        onSubmit &&
        ((event) => {
          event.preventDefault();
          const submitter = (event.nativeEvent as SubmitEvent).submitter;
          onSubmit(new FormData(event.currentTarget, submitter ?? undefined), event);
        })
      }
    >
      {children}
    </form>
  );
});
