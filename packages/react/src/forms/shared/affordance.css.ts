import { style } from '@vanilla-extract/css';

/**
 * Shared recipe for icon-only buttons rendered inside a text-like input's
 * right slot — clear buttons, password toggles, reveal icons. Transparent
 * surface, inherits color from the input's text color.
 */
export const inputAffordance = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'currentColor',
  padding: 0,
});
