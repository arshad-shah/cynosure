import { describe, expect, it } from 'vitest';
import { computePoint } from '../shared/useFloatingPosition.js';

/**
 * `computePoint` is the pure geometry behind every overlay (Popover, Tooltip,
 * HoverCard, menus). jsdom can't measure layout, so the placement math is
 * verified here directly rather than through render tests.
 */

// Anchor: 50×20 box at (100, 100) → right 150, bottom 120.
const anchor = {
  left: 100,
  top: 100,
  right: 150,
  bottom: 120,
  width: 50,
  height: 20,
  x: 100,
  y: 100,
  toJSON: () => ({}),
} as DOMRect;

// Floating element: 80 wide × 40 tall.
const float = { width: 80, height: 40 };

describe('computePoint', () => {
  it('places below the anchor for side="bottom"', () => {
    // y = anchor.bottom; x centered: left + width/2 - float.width/2 = 100 + 25 - 40
    expect(computePoint(anchor, float, 'bottom', 'center', 0, 0)).toEqual({ x: 85, y: 120 });
  });

  it('places above the anchor for side="top"', () => {
    // y = anchor.top - float.height = 100 - 40
    expect(computePoint(anchor, float, 'top', 'center', 0, 0)).toEqual({ x: 85, y: 60 });
  });

  it('places to the right for side="right"', () => {
    // x = anchor.right; y centered: top + height/2 - float.height/2 = 100 + 10 - 20
    expect(computePoint(anchor, float, 'right', 'center', 0, 0)).toEqual({ x: 150, y: 90 });
  });

  it('places to the left for side="left"', () => {
    // x = anchor.left - float.width = 100 - 80
    expect(computePoint(anchor, float, 'left', 'center', 0, 0)).toEqual({ x: 20, y: 90 });
  });

  it('aligns to the anchor start edge on a vertical side', () => {
    expect(computePoint(anchor, float, 'bottom', 'start', 0, 0).x).toBe(100);
  });

  it('aligns to the anchor end edge on a vertical side', () => {
    // x = anchor.right - float.width = 150 - 80
    expect(computePoint(anchor, float, 'bottom', 'end', 0, 0).x).toBe(70);
  });

  it('aligns to the anchor start edge on a horizontal side', () => {
    expect(computePoint(anchor, float, 'right', 'start', 0, 0).y).toBe(100);
  });

  it('aligns to the anchor end edge on a horizontal side', () => {
    // y = anchor.bottom - float.height = 120 - 40
    expect(computePoint(anchor, float, 'right', 'end', 0, 0).y).toBe(80);
  });

  it('pushes away from the anchor along the side axis by sideOffset', () => {
    expect(computePoint(anchor, float, 'bottom', 'center', 8, 0).y).toBe(128);
    expect(computePoint(anchor, float, 'top', 'center', 8, 0).y).toBe(52);
    expect(computePoint(anchor, float, 'right', 'center', 8, 0).x).toBe(158);
    expect(computePoint(anchor, float, 'left', 'center', 8, 0).x).toBe(12);
  });

  it('shifts along the alignment axis by alignOffset', () => {
    // Centered x is 85; alignOffset nudges it along the cross axis.
    expect(computePoint(anchor, float, 'bottom', 'center', 0, 10).x).toBe(95);
    // Centered y is 90 on a horizontal side.
    expect(computePoint(anchor, float, 'right', 'center', 0, -10).y).toBe(80);
  });
});
