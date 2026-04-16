import { useEffect } from 'react';
import { useCallbackRef } from './useCallbackRef.js';

/**
 * Declarative `setTimeout`. Pass `null` for `delay` to cancel without
 * unmounting; changing `delay` re-schedules the timer.
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const stable = useCallbackRef(callback);

  useEffect(() => {
    if (delay === null) return;
    const id = window.setTimeout(() => stable(), delay);
    return () => window.clearTimeout(id);
  }, [delay, stable]);
}
