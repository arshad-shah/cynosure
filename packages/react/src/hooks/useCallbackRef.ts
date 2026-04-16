import { useCallback, useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect.js';

/**
 * Returns a stable function identity that always calls the latest version of
 * `callback`. Useful for passing user-supplied handlers into effects or to
 * other hooks without refreshing them on every render.
 */
export function useCallbackRef<T extends (...args: never[]) => unknown>(
  callback: T | undefined,
): T {
  const callbackRef = useRef(callback);

  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: unknown[]) =>
      (callbackRef.current as ((...args: unknown[]) => unknown) | undefined)?.(
        ...args,
      )) as unknown as T,
    [],
  );
}
