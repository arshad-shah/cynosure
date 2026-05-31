import type { CSSProperties, ReactElement } from 'react';
import type { FloatingSide } from './useFloatingPosition.js';

export interface OverlayArrowProps {
  /** The side the surface sits on, relative to its anchor (post-collision). */
  side: FloatingSide;
  /**
   * Cross-axis position (px, relative to the surface box) the caret points
   * from. Omit to centre the caret (the Tooltip default). Overlays that track
   * the anchor pass `arrowOffset` from `useFloatingPosition` so the caret stays
   * aimed at the trigger.
   */
  offset?: number;
  /** Class carrying the fill/stroke for the caret (per-surface colour). */
  className?: string;
  /** Base length along the surface edge. */
  long?: number;
  /** How far the caret pokes toward the anchor. */
  depth?: number;
}

/**
 * Per-side caret with explicit geometry (no rotation hacks, which mis-size the
 * left/right beak). The triangle points outward toward the anchor and overlaps
 * the surface edge by its full depth so it reads as attached. Shared by
 * Tooltip, Popover, and HoverCard so caret placement stays "intelligent"
 * (side-aware + anchor-aimed) and consistent across overlays.
 */
export function OverlayArrow({
  side,
  offset,
  className,
  long = 12,
  depth = 6,
}: OverlayArrowProps): ReactElement {
  const horizontal = side === 'left' || side === 'right';
  const w = horizontal ? depth : long;
  const h = horizontal ? long : depth;
  const path =
    side === 'top'
      ? `M0 0 L${long / 2} ${depth} L${long} 0 Z` // points down
      : side === 'bottom'
        ? `M0 ${depth} L${long / 2} 0 L${long} ${depth} Z` // points up
        : side === 'left'
          ? `M0 0 L${depth} ${long / 2} L0 ${long} Z` // points right
          : `M${depth} 0 L0 ${long / 2} L${depth} ${long} Z`; // (right) points left

  // Centre the caret when no offset is given; otherwise pin it `offset` px
  // along the cross-axis (translate back by half its own length to centre on
  // that point).
  const crossAxis = horizontal
    ? offset == null
      ? { top: '50%', transform: 'translateY(-50%)' }
      : { top: offset - long / 2 }
    : offset == null
      ? { left: '50%', transform: 'translateX(-50%)' }
      : { left: offset - long / 2 };

  const place: CSSProperties =
    side === 'top'
      ? { bottom: -depth, ...crossAxis }
      : side === 'bottom'
        ? { top: -depth, ...crossAxis }
        : side === 'left'
          ? { right: -depth, ...crossAxis }
          : { left: -depth, ...crossAxis };

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      style={{ position: 'absolute', ...place }}
    >
      <path d={path} />
    </svg>
  );
}
