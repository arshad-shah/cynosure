import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Cynosure chart wrapper. SwiftChart paints onto a `<canvas>` so we don't need
 * the per-class SVG selector overrides Recharts required — colour resolution
 * happens via the SwiftChart `theme` object (driven by Cynosure CSS custom
 * properties in `Chart.tsx`).
 *
 * The wrapper itself just provides:
 *   - sizing (consumers typically set `aspectRatio` or `height` via prop)
 *   - tabular numerics so tooltip values line up
 *   - a transparent backdrop so the chart inherits the surrounding card /
 *     section background
 */
export const chartContainer = style({
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  color: vars.color.foreground.default,
  fontVariantNumeric: 'tabular-nums',
  background: 'transparent',
});
