import { type RefObject, useEffect, useState } from 'react';

/**
 * Observes a single element with `ResizeObserver` and returns the latest
 * `ResizeObserverEntry`. Returns `null` until the observer has fired at
 * least once; consumers should null-check.
 */
export function useResizeObserver<T extends Element>(
  ref: RefObject<T | null>,
): ResizeObserverEntry | null {
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([incoming]) => {
      if (incoming) setEntry(incoming);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return entry;
}
