import { useEffect } from 'react';
import { useCallbackRef } from './useCallbackRef.js';

/**
 * Declarative `setInterval`. Pass `null` for `delay` to pause without
 * unmounting. The callback identity is stabilised so consumers don't have to
 * memoise before passing it in.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const stable = useCallbackRef(callback);

  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => stable(), delay);
    return () => window.clearInterval(id);
  }, [delay, stable]);
}
