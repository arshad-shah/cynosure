import { useEffect, useRef } from "react";

export interface HiddenValueProps {
  name?: string | undefined;
  value: string;
  form?: string | undefined;
  /** Fails form validation while value is empty. */
  required?: boolean | undefined;
  /** Message used when required and empty. */
  requiredMessage?: string;
  /** Called when the owning form is reset, so the widget can restore its default. */
  onReset?: (() => void) | undefined;
  /** Disabled values are neither submitted nor validated (like native disabled controls). */
  disabled?: boolean | undefined;
  /**
   * Called when validation fails. Call `event.preventDefault()` to stop the browser reporting on this hidden input,
   * then focus and explain on the widget's visible control instead.
   */
  onInvalid?: ((event: Event) => void) | undefined;
}

/** Foundation: lets custom widgets (Select) take part in native forms: FormData, reset, required and disabled. */
export function HiddenValue({
  name,
  value,
  form,
  required,
  requiredMessage = "Please choose a value.",
  onReset,
  disabled,
  onInvalid,
}: HiddenValueProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.setCustomValidity(required && !value ? requiredMessage : "");
  }, [required, value, requiredMessage]);
  useEffect(() => {
    const input = ref.current;
    if (!input || !onInvalid) return;
    input.addEventListener("invalid", onInvalid);
    return () => input.removeEventListener("invalid", onInvalid);
  }, [onInvalid]);
  useEffect(() => {
    const owner = ref.current?.form;
    if (!owner || !onReset) return;
    owner.addEventListener("reset", onReset);
    return () => owner.removeEventListener("reset", onReset);
  }, [onReset]);
  // A text input (not type=hidden) so constraint validation applies; it is visually and semantically hidden.
  return (
    <input
      ref={ref}
      className="cy-hidden-value"
      name={name}
      form={form}
      value={value}
      disabled={disabled}
      onChange={() => {}}
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}
