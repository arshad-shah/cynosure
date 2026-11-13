import type { Ref } from "react";

/** Points a ref at a value: calls a callback ref, or sets an object ref's `current`. Nothing for a missing ref. */
export function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/**
 * One callback ref that points every given ref at the element (a component's own ref and the one it was handed).
 * Wrap it in `useMemo` when the callback's identity matters: a new callback detaches and reattaches the element.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (value: T | null) => {
    for (const ref of refs) setRef(ref, value);
  };
}
