/**
 * Ref-counted body scroll lock.
 *
 * Radix's Dialog (and our wrapping AlertDialog/Drawer) already locks body
 * scroll internally, so consumers of those components don't need to do
 * anything. We expose this for custom overlays (e.g. a non-Radix Drawer
 * extension) that still need the behaviour without reimplementing it.
 *
 * Each `lock()` increments a counter; only the first lock mutates the
 * `<body>` styles, and only the last `unlock()` restores them. This lets
 * multiple overlays coexist without fighting over the scroll state.
 */

let lockCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

const isBrowser = typeof document !== 'undefined';

/** Engage the scroll lock and return the matching unlock callback. */
export function lockBodyScroll(): () => void {
  if (!isBrowser) return noop;

  lockCount += 1;
  if (lockCount === 1) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0 && isBrowser) {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    }
  };
}

const noop = () => {};

/** Escape hatch for tests. */
export const __resetScrollLock = () => {
  lockCount = 0;
  previousOverflow = '';
  previousPaddingRight = '';
};
