import { type RefObject, useEffect, useState } from 'react';

export interface UseIntersectionOptions extends IntersectionObserverInit {
  /** When `true`, disconnect the observer after the first intersection. */
  once?: boolean;
}

/**
 * Observes a single element with `IntersectionObserver` and returns its
 * latest `IntersectionObserverEntry`. Returns `null` until the observer
 * fires the first callback, so consumers should null-check.
 */
export function useIntersection<T extends Element>(
  ref: RefObject<T | null>,
  options: UseIntersectionOptions = {},
): IntersectionObserverEntry | null {
  const { root, rootMargin, threshold, once } = options;
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([incoming]) => {
        if (!incoming) return;
        setEntry(incoming);
        if (once && incoming.isIntersecting) observer.disconnect();
      },
      { root, rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, root, rootMargin, threshold, once]);

  return entry;
}
