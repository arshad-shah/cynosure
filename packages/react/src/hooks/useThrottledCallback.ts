import { useEffect, useMemo, useRef } from 'react';
import { useCallbackRef } from './useCallbackRef.js';

/**
 * Returns a throttled version of `callback` that fires at most once per
 * `delay` ms. Leading-edge by default; the trailing call (if any) fires at
 * the end of the window with the most recent arguments.
 */
export function useThrottledCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const stable = useCallbackRef(callback);
  const lastRunRef = useRef(0);
  const timeoutRef = useRef<number | undefined>(undefined);
  const lastArgsRef = useRef<Args | undefined>(undefined);

  useEffect(
    () => () => {
      if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  return useMemo(
    () =>
      (...args: Args) => {
        const now = Date.now();
        const elapsed = now - lastRunRef.current;
        lastArgsRef.current = args;

        if (elapsed >= delay) {
          lastRunRef.current = now;
          stable(...args);
          return;
        }

        if (timeoutRef.current === undefined) {
          timeoutRef.current = window.setTimeout(() => {
            lastRunRef.current = Date.now();
            timeoutRef.current = undefined;
            if (lastArgsRef.current) stable(...lastArgsRef.current);
          }, delay - elapsed);
        }
      },
    [delay, stable],
  );
}
