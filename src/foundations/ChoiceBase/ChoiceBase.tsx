import { forwardRef, type InputHTMLAttributes, useCallback, useRef } from "react";
import { useClientLayoutEffect } from "../client-layout-effect.js";

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
  { indeterminate = false, className, ...rest },
  forwarded,
) {
  const inner = useRef<HTMLInputElement | null>(null);
  const ref = useCallback(
    (node: HTMLInputElement | null) => {
      inner.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [forwarded],
  );
  useClientLayoutEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} className={`cy-choice-input${className ? ` ${className}` : ""}`} {...rest} />;
});
