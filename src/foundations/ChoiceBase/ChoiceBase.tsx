import { type ChangeEvent, forwardRef, type InputHTMLAttributes, useMemo, useRef } from "react";
import { useClientLayoutEffect } from "../client-layout-effect.js";
import { mergeRefs } from "../refs.js";

export interface ChoiceBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Which native control to render. */
  type: "checkbox" | "radio";
  /** Checkbox only: the mixed state (aria-checked="mixed"). */
  indeterminate?: boolean;
}

/**
 * Foundation: a native checkbox or radio, visually hidden under a Cynosure skin but still focusable, clickable and
 * form-associated (FormData, reset, required) for free.
 */
export const ChoiceBase = forwardRef<HTMLInputElement, ChoiceBaseProps>(function ChoiceBase(
  { indeterminate = false, className, onChange, ...rest },
  forwarded,
) {
  const inner = useRef<HTMLInputElement | null>(null);
  const ref = useMemo(() => mergeRefs(inner, forwarded), [forwarded]);
  useClientLayoutEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      className={`cy-choice-base${className ? ` ${className}` : ""}`}
      {...rest}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
        // A click clears the browser's mixed state; while the prop still says mixed, put it back.
        event.currentTarget.indeterminate = indeterminate;
      }}
    />
  );
});
