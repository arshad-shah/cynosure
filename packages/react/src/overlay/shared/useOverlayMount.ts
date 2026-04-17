import { useEffect, useRef, useState } from 'react';

/**
 * Tracks the exit animation of a portal'd overlay.
 *
 * Radix's own `Presence` primitive already handles this for every overlay
 * we wrap (Dialog/Popover/Tooltip/Menu/HoverCard all unmount their content
 * after the exit animation finishes), so consumers don't need to call this
 * directly. We export it for parity with the spec and for custom overlays
 * that don't rely on Radix.
 *
 * Usage:
 * ```tsx
 * const [rendered, setRendered] = useOverlayMount(open);
 * if (!rendered) return null;
 * return <div data-state={open ? 'open' : 'closed'} onAnimationEnd={...} />;
 * ```
 */
export function useOverlayMount(open: boolean): readonly [boolean, (done: boolean) => void] {
  const [rendered, setRendered] = useState(open);
  const prev = useRef(open);

  useEffect(() => {
    if (open) setRendered(true);
    prev.current = open;
  }, [open]);

  const onAnimationComplete = (done: boolean) => {
    if (!open && done) setRendered(false);
  };

  return [rendered, onAnimationComplete] as const;
}
