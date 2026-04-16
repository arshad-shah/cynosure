import { useEffect, useRef } from 'react';

/**
 * Captures the currently focused element when `active` becomes true and
 * restores focus to it when `active` becomes false (or the component
 * unmounts). Pair with modal-style components that steal focus on open.
 */
export function useFocusReturn(active: boolean): void {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocusedRef.current =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

    return () => {
      const target = previouslyFocusedRef.current;
      if (target && typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      }
      previouslyFocusedRef.current = null;
    };
  }, [active]);
}
