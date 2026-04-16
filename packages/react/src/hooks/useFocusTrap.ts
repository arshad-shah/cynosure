import { type RefObject, useEffect } from 'react';
import { getOwnerDocument } from '../utils/getOwnerDocument.js';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

const isVisible = (el: HTMLElement): boolean => {
  if (el.hidden) return false;
  const style = el.ownerDocument.defaultView?.getComputedStyle(el);
  if (!style) return true;
  return style.visibility !== 'hidden' && style.display !== 'none';
};

const getFocusable = (container: HTMLElement): HTMLElement[] => {
  const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(nodes).filter(isVisible);
};

/**
 * Traps Tab/Shift+Tab focus inside the ref'd container while `enabled` is
 * true. On enable, focus moves to the first focusable descendant. On
 * disable, focus returns to whatever was focused when the trap activated.
 *
 * For dialogs, prefer React Aria's `FocusScope` when it's available — this
 * hook is the low-level fallback used by tooltip-style surfaces.
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const container = ref.current;
    if (!container) return;

    const doc = getOwnerDocument(container);
    const previouslyFocused = doc.activeElement as HTMLElement | null;

    const firstFocusable = getFocusable(container)[0] ?? container;
    firstFocusable.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      const active = doc.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    doc.addEventListener('keydown', handleKeyDown, true);
    return () => {
      doc.removeEventListener('keydown', handleKeyDown, true);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [ref, enabled]);
}
