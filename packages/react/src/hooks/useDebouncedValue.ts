import { useEffect, useState } from 'react';

/**
 * Returns `value` but only updates the returned reference `delay` ms after
 * the source settles. Canonical use-case: debouncing a search input before
 * firing a network request.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
