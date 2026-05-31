import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type FloatingSide = 'top' | 'right' | 'bottom' | 'left';
export type FloatingAlign = 'start' | 'center' | 'end';

export interface FloatingOptions {
  /** The anchor element to position against. Null disables positioning. */
  anchor: HTMLElement | null;
  /** Whether the floating element is open / mounted. */
  open: boolean;
  /** Preferred side; flipped when there's not enough room and `avoidCollisions` is on. */
  side?: FloatingSide;
  /** Alignment along the chosen side. */
  align?: FloatingAlign;
  /** Distance (px) between the anchor and the floating element. */
  sideOffset?: number;
  /** Offset (px) along the alignment axis. */
  alignOffset?: number;
  /** Flip to the opposite side / shift along the cross-axis when colliding. */
  avoidCollisions?: boolean;
  /** Padding (px) reserved from the viewport edge during collision detection. */
  collisionPadding?: number;
}

export interface FloatingState {
  /** Position the floating element using `position: fixed; left/top`. */
  x: number;
  y: number;
  /** The side actually used after collision detection. */
  side: FloatingSide;
  /** The alignment actually used. */
  align: FloatingAlign;
  /**
   * Cross-axis coordinate (px, relative to the floating element's own box)
   * at which an arrow should point so it stays aimed at the anchor's centre
   * even when alignment or collision-shifting moves the surface. For
   * top/bottom sides this is a horizontal offset; for left/right it's
   * vertical. Clamped so the arrow never escapes the surface's rounded
   * corners.
   */
  arrowOffset: number;
  /** Whether layout has been computed at least once. */
  ready: boolean;
}

/** Keep the arrow inside the surface's rounded corners. */
const ARROW_INSET = 14;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const OPPOSITE: Record<FloatingSide, FloatingSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const isVertical = (side: FloatingSide): boolean => side === 'top' || side === 'bottom';

/**
 * Compute viewport-fixed coordinates for `anchorRect`-relative placement on
 * `side`+`align`. Pure function so it's trivially unit-testable.
 *
 * Exported for unit testing — this is the geometry every overlay (Popover,
 * Tooltip, HoverCard, menus) positions against, so it's covered directly
 * rather than only through jsdom render tests that can't measure layout.
 */
export function computePoint(
  anchorRect: DOMRect,
  floatRect: { width: number; height: number },
  side: FloatingSide,
  align: FloatingAlign,
  sideOffset: number,
  alignOffset: number,
): { x: number; y: number } {
  let x = 0;
  let y = 0;
  if (isVertical(side)) {
    if (side === 'top') y = anchorRect.top - floatRect.height - sideOffset;
    else y = anchorRect.bottom + sideOffset;
    if (align === 'start') x = anchorRect.left + alignOffset;
    else if (align === 'end') x = anchorRect.right - floatRect.width - alignOffset;
    else x = anchorRect.left + anchorRect.width / 2 - floatRect.width / 2 + alignOffset;
  } else {
    if (side === 'left') x = anchorRect.left - floatRect.width - sideOffset;
    else x = anchorRect.right + sideOffset;
    if (align === 'start') y = anchorRect.top + alignOffset;
    else if (align === 'end') y = anchorRect.bottom - floatRect.height - alignOffset;
    else y = anchorRect.top + anchorRect.height / 2 - floatRect.height / 2 + alignOffset;
  }
  return { x, y };
}

/**
 * Position a floating element against an anchor with optional collision
 * flipping. Returns `{ x, y, side, align, ready }` plus a `ref` to attach
 * to the floating element. Re-measures on resize, scroll, anchor mutation,
 * and floating-element resize so the position tracks layout changes.
 *
 * Owned in-tree to avoid pulling `@floating-ui/react` or Radix's
 * `@radix-ui/react-popper` (~8 KB gzip combined) for the modest set of
 * placement features we actually use.
 */
export function useFloatingPosition(options: FloatingOptions): FloatingState & {
  ref: (node: HTMLElement | null) => void;
} {
  const {
    anchor,
    open,
    side: preferredSide = 'bottom',
    align: preferredAlign = 'center',
    sideOffset = 0,
    alignOffset = 0,
    avoidCollisions = true,
    collisionPadding = 8,
  } = options;
  const [state, setState] = useState<FloatingState>({
    x: 0,
    y: 0,
    side: preferredSide,
    align: preferredAlign,
    arrowOffset: 0,
    ready: false,
  });
  const floatingRef = useRef<HTMLElement | null>(null);

  const measure = useCallback(() => {
    const anchorEl = anchor;
    const floatEl = floatingRef.current;
    if (!anchorEl || !floatEl || !open) return;
    const anchorRect = anchorEl.getBoundingClientRect();
    const floatRect = floatEl.getBoundingClientRect();
    if (floatRect.width === 0 || floatRect.height === 0) {
      // Float element not yet sized — try again on the next observer tick.
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let side = preferredSide;
    const align = preferredAlign;
    let { x, y } = computePoint(anchorRect, floatRect, side, align, sideOffset, alignOffset);

    if (avoidCollisions) {
      // Flip to the opposite side if the preferred side overflows the viewport.
      const overflows =
        (side === 'top' && y < collisionPadding) ||
        (side === 'bottom' && y + floatRect.height > vh - collisionPadding) ||
        (side === 'left' && x < collisionPadding) ||
        (side === 'right' && x + floatRect.width > vw - collisionPadding);
      if (overflows) {
        const flippedSide = OPPOSITE[side];
        const flipped = computePoint(
          anchorRect,
          floatRect,
          flippedSide,
          align,
          sideOffset,
          alignOffset,
        );
        const flippedFits =
          (flippedSide === 'top' && flipped.y >= collisionPadding) ||
          (flippedSide === 'bottom' && flipped.y + floatRect.height <= vh - collisionPadding) ||
          (flippedSide === 'left' && flipped.x >= collisionPadding) ||
          (flippedSide === 'right' && flipped.x + floatRect.width <= vw - collisionPadding);
        if (flippedFits) {
          side = flippedSide;
          x = flipped.x;
          y = flipped.y;
        }
      }
      // Shift along the cross-axis to keep within the viewport.
      if (isVertical(side)) {
        if (x < collisionPadding) x = collisionPadding;
        if (x + floatRect.width > vw - collisionPadding) {
          x = vw - collisionPadding - floatRect.width;
        }
      } else {
        if (y < collisionPadding) y = collisionPadding;
        if (y + floatRect.height > vh - collisionPadding) {
          y = vh - collisionPadding - floatRect.height;
        }
      }
    }

    // Aim the arrow at the anchor's centre, projected onto the floating
    // element's cross-axis and clamped within its rounded corners. This keeps
    // the caret pointing at the trigger even when alignment or collision-shift
    // slides the surface off-centre.
    let arrowOffset: number;
    if (isVertical(side)) {
      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      arrowOffset = clamp(
        anchorCenterX - x,
        ARROW_INSET,
        Math.max(ARROW_INSET, floatRect.width - ARROW_INSET),
      );
    } else {
      const anchorCenterY = anchorRect.top + anchorRect.height / 2;
      arrowOffset = clamp(
        anchorCenterY - y,
        ARROW_INSET,
        Math.max(ARROW_INSET, floatRect.height - ARROW_INSET),
      );
    }

    setState((prev) => {
      if (
        prev.x === x &&
        prev.y === y &&
        prev.side === side &&
        prev.align === align &&
        prev.arrowOffset === arrowOffset &&
        prev.ready
      ) {
        return prev;
      }
      return { x, y, side, align, arrowOffset, ready: true };
    });
  }, [
    anchor,
    open,
    preferredSide,
    preferredAlign,
    sideOffset,
    alignOffset,
    avoidCollisions,
    collisionPadding,
  ]);

  // useLayoutEffect first, then keep up via ResizeObserver + scroll/resize.
  useLayoutEffect(() => {
    if (!open) {
      setState((prev) => ({ ...prev, ready: false }));
      return undefined;
    }
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => measure());
    if (anchor) ro.observe(anchor);
    if (floatingRef.current) ro.observe(floatingRef.current);
    return () => ro.disconnect();
  }, [anchor, open, measure]);

  useEffect(() => {
    if (!open) return undefined;
    const onChange = () => measure();
    window.addEventListener('resize', onChange);
    // Capture so ancestor scrollers also trigger re-measure.
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [open, measure]);

  const ref = useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
  }, []);

  return { ...state, ref };
}
