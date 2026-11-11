import { useCallback, useRef, useState } from "react";

/**
 * A value the parent may control (`value` given) or leave to the component (`defaultValue`). Returns the current
 * value, a stable `set` that updates the component's own copy when uncontrolled and always tells `onChange`, and
 * `reset`, which goes back to a value without telling the parent (a form reset: a controlled value is the parent's).
 */
export function useControllableState<T, D extends T | undefined = T>(
  value: T | undefined,
  defaultValue: D | (() => D),
  onChange?: ((next: T) => void) | undefined,
) {
  const [own, setOwn] = useState<T | D>(defaultValue);
  const controlled = value !== undefined;
  const latest = useRef({ controlled, onChange });
  latest.current = { controlled, onChange };
  const set = useCallback((next: T) => {
    if (!latest.current.controlled) setOwn(() => next);
    latest.current.onChange?.(next);
  }, []);
  const reset = useCallback((to: T | D) => {
    if (!latest.current.controlled) setOwn(() => to);
  }, []);
  return [controlled ? (value as T) : own, set, reset] as const;
}
