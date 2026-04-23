// packages/react/src/feedback/Indicator/Indicator.css.ts
import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const indicatorRoot = style({
  position: 'relative',
  display: 'inline-flex',
  verticalAlign: 'middle',
});

/**
 * Wraps the inner <Badge> so we can position it without touching Badge's
 * own styles. Uses a CSS variable for the offset so consumers can pass it
 * via the `offset` prop → inline `style`.
 */
export const indicatorBadgeWrapper = style({
  position: 'absolute',
  vars: {
    '--indicator-offset': '0px',
  },
  pointerEvents: 'none',
  zIndex: 1,
});

export const indicatorHidden = style({
  visibility: 'hidden',
});

export const indicatorPlacement = styleVariants({
  'top-end': {
    top: 0,
    insetInlineEnd: 0,
    transform:
      'translate(calc(50% + var(--indicator-offset)), calc(-50% - var(--indicator-offset)))',
  },
  'top-start': {
    top: 0,
    insetInlineStart: 0,
    transform:
      'translate(calc(-50% - var(--indicator-offset)), calc(-50% - var(--indicator-offset)))',
  },
  'bottom-end': {
    bottom: 0,
    insetInlineEnd: 0,
    transform:
      'translate(calc(50% + var(--indicator-offset)), calc(50% + var(--indicator-offset)))',
  },
  'bottom-start': {
    bottom: 0,
    insetInlineStart: 0,
    transform:
      'translate(calc(-50% - var(--indicator-offset)), calc(50% + var(--indicator-offset)))',
  },
});

// vars imported only to ensure path resolves; not directly used yet.
void vars;
