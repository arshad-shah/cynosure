import { vars } from './vars.css.js';

/**
 * The single source of truth for keyboard-focus rings.
 *
 * Components must never hand-roll a focus outline — they import these so the
 * ring geometry and colour both flow from the token foundation. The colour
 * resolves to `var(--cynosure-color-accent-ring)`, so the ring stays
 * theme-aware (light / dark / high-contrast) without any per-component work.
 *
 * Usage:
 *   selectors: { '&:focus-visible': { boxShadow: focusRing } }
 */
export const focusRing = `0 0 0 2px ${vars.color.accent.ring}`;

/**
 * Inset variant for elements that clip their overflow (table cells, list
 * rows, accordion headers) where an outset ring would be hidden.
 */
export const focusRingInset = `inset 0 0 0 2px ${vars.color.accent.ring}`;
