import { type KeyboardEvent, type RefObject, useCallback, useEffect, useRef } from 'react';

/**
 * Roving-focus pattern for a container of `[data-roving-focus-item]` elements.
 * ArrowUp/Down cycle, Home/End jump, disabled items are skipped. Consumers
 * render items; they don't need to manage focus themselves.
 */
export function useRovingFocus<T extends HTMLElement>(): {
  containerRef: RefObject<T | null>;
} {
  const containerRef = useRef<T>(null);

  const getItems = useCallback((): HTMLElement[] => {
    const root = containerRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>('[data-roving-focus-item]')).filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true',
    );
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const onKeyDown = (e: Event) => {
      const ev = e as unknown as KeyboardEvent<HTMLElement>;
      const items = getItems();
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? items.indexOf(active) : -1;
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        const next = idx < 0 ? 0 : (idx + 1) % items.length;
        items[next]?.focus();
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        const next = idx < 0 ? items.length - 1 : (idx - 1 + items.length) % items.length;
        items[next]?.focus();
      } else if (ev.key === 'Home') {
        ev.preventDefault();
        items[0]?.focus();
      } else if (ev.key === 'End') {
        ev.preventDefault();
        items[items.length - 1]?.focus();
      }
    };
    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [getItems]);

  return { containerRef };
}
