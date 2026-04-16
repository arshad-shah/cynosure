import type { Ref, RefCallback } from 'react';

type PossibleRef<T> = Ref<T> | undefined;

/**
 * Assigns a value to a single ref, whether it's a ref-object or a ref-callback.
 * React 19 returns a cleanup function from ref callbacks when available; we
 * forward that cleanup so callers who wire multiple refs get a matching
 * teardown from {@link composeRefs}.
 */
function setRef<T>(ref: PossibleRef<T>, value: T): (() => void) | undefined {
  if (typeof ref === 'function') {
    const cleanup = ref(value);
    if (typeof cleanup === 'function') return cleanup;
    return () => ref(null);
  }
  if (ref != null && typeof ref === 'object') {
    (ref as { current: T }).current = value;
    return () => {
      (ref as { current: T | null }).current = null;
    };
  }
}

/**
 * Combines any number of refs into a single ref-callback. Any `null`/
 * `undefined` inputs are ignored, so callers can spread optional refs.
 */
export function composeRefs<T>(...refs: Array<PossibleRef<T>>): RefCallback<T> {
  return (node) => {
    const cleanups: Array<() => void> = [];
    for (const ref of refs) {
      const cleanup = setRef(ref, node);
      if (cleanup) cleanups.push(cleanup);
    }
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  };
}
