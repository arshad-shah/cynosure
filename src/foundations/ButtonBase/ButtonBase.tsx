import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Defaults to "button" so a Cynosure button never submits a form by accident. */
  type?: "button" | "submit" | "reset";
  /** Toggle state; mirrored to aria-pressed and data-pressed. */
  pressed?: boolean;
}

/** Foundation: the only place Cynosure renders a native <button>. */
export const ButtonBase = forwardRef<HTMLButtonElement, ButtonBaseProps>(function ButtonBase(
  { type = "button", pressed, ...rest },
  ref,
) {
  return (
    // biome-ignore lint/a11y/useButtonType: type is always set from the prop (default "button")
    <button ref={ref} type={type} aria-pressed={pressed} data-pressed={pressed ? "" : undefined} {...rest} />
  );
});
