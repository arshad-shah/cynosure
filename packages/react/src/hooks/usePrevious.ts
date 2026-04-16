import { useEffect, useRef } from 'react';

/**
 * Returns the value from the previous render, or `undefined` on the first
 * render. Handy for comparing against incoming props in effects.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
