import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { lockBodyScroll } from './ScrollLock.js';

export interface UseDialogOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogState {
  open: boolean;
  setOpen: (next: boolean) => void;
  titleId: string;
  descriptionId: string;
  /** Element to return focus to on close. */
  triggerRef: { current: HTMLElement | null };
}

/**
 * Shared state + scroll-lock for the in-tree dialog family (`Dialog`,
 * `Drawer`, `AlertDialog`). Owns the open state (controlled or
 * uncontrolled), stable `titleId`/`descriptionId` for ARIA wiring, and
 * the trigger ref the focus-trap uses to restore focus on close.
 *
 * Scroll lock activates on every transition to `open=true` and releases
 * on the matching close; the shared `lockBodyScroll` helper ref-counts
 * so stacked dialogs don't fight over the body styles.
 */
export function useDialogState(options: UseDialogOptions = {}): DialogState {
  const [open, setOpen] = useControllableState<boolean>({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });
  const idBase = useId();
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const release = lockBodyScroll();
    return release;
  }, [open]);

  return useMemo(
    () => ({
      open,
      setOpen,
      titleId: `${idBase}-title`,
      descriptionId: `${idBase}-description`,
      triggerRef,
    }),
    [open, setOpen, idBase],
  );
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface FocusTrapOptions {
  /** Whether the trap is active. */
  active: boolean;
  /** Container that holds the focus. */
  containerRef: { current: HTMLElement | null };
  /** Element to focus when the trap activates. Defaults to first focusable. */
  initialFocus?: 'first' | 'none';
  /** Element to return focus to when the trap deactivates. */
  returnFocusRef: { current: HTMLElement | null };
}

/**
 * Mount a focus trap inside `containerRef`. On activation, focuses the
 * first descendant matching `FOCUSABLE_SELECTOR` (or the container
 * itself if none). While active, intercepts `Tab` / `Shift+Tab` to keep
 * focus inside. On deactivation, returns focus to `returnFocusRef` if
 * it's still in the document.
 */
export function useFocusTrap({
  active,
  containerRef,
  initialFocus = 'first',
  returnFocusRef,
}: FocusTrapOptions): void {
  useEffect(() => {
    if (!active) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;
    const previous = returnFocusRef.current;
    if (initialFocus === 'first') {
      const first = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? container).focus();
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last?.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [active, containerRef, initialFocus, returnFocusRef]);
}

export const focusableSelector = FOCUSABLE_SELECTOR;

/** Trigger an `onOpenChange` change when `Escape` is pressed. */
export function useEscapeToClose(active: boolean, close: () => void): void {
  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    },
    [close],
  );
  useEffect(() => {
    if (!active) return undefined;
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [active, handler]);
}
