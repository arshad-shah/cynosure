import { createGlobalThemeContract, globalStyle } from '@vanilla-extract/css';
import { toCssName } from './tokenPath.js';

/**
 * Typed mirror of the `@arshad-shah/cynosure-tokens` CSS custom properties.
 *
 * The contract only types the names — consumers must import
 * `@arshad-shah/cynosure-tokens/css` (and optionally `@arshad-shah/cynosure-tokens/css/dark`) at runtime for
 * the values. Every leaf is the CSS variable name (sans the leading `--`),
 * so referring to e.g. `vars.color.accent.solid` inside a `.css.ts` file
 * emits `var(--cynosure-color-accent-solid)` at build time.
 *
 * The key shape here mirrors the token tree *logically*. The shared `toCssName`
 * mapper (`./tokenPath`) performs the camelCase → kebab-case and `.` → `-`
 * transforms that Style Dictionary performs for the actual CSS custom property
 * names, so the contract stays a faithful reflection of the token CSS — and the
 * `defineTheme` authoring helper resolves identical names.
 */

export const vars = createGlobalThemeContract(
  {
    color: {
      background: {
        canvas: '',
        surface: '',
        subtle: '',
        muted: '',
        raised: '',
        overlay: '',
        inverse: '',
      },
      foreground: {
        default: '',
        muted: '',
        subtle: '',
        disabled: '',
        inverse: '',
        onAccent: '',
      },
      border: {
        default: '',
        subtle: '',
        strong: '',
        focus: '',
        disabled: '',
      },
      accent: {
        solid: '',
        solidHover: '',
        solidActive: '',
        soft: '',
        softHover: '',
        softActive: '',
        ring: '',
        onSolid: '',
      },
      feedback: {
        success: { solid: '', soft: '', foreground: '', border: '', onSolid: '' },
        danger: { solid: '', soft: '', foreground: '', border: '', onSolid: '' },
        warning: { solid: '', soft: '', foreground: '', border: '', onSolid: '' },
        info: { solid: '', soft: '', foreground: '', border: '', onSolid: '' },
      },
      // Categorical series palette for charts. Indexed 1–8; SwiftChart cycles
      // modulo length for series beyond the eighth.
      chart: {
        '1': '',
        '2': '',
        '3': '',
        '4': '',
        '5': '',
        '6': '',
        '7': '',
        '8': '',
      },
    },
    space: {
      '0': '',
      '0.5': '',
      '1': '',
      '1.5': '',
      '2': '',
      '3': '',
      '4': '',
      '5': '',
      '6': '',
      '8': '',
      '10': '',
      '12': '',
      '16': '',
      '20': '',
      '24': '',
      '32': '',
      '40': '',
      '48': '',
      '64': '',
    },
    radius: {
      none: '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
      '2xl': '',
      full: '',
    },
    shadow: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
      '2xl': '',
      focusRing: '',
    },
    duration: {
      instant: '',
      fast: '',
      normal: '',
      slow: '',
      slower: '',
    },
    easing: {
      linear: '',
      easeIn: '',
      easeOut: '',
      easeInOut: '',
      spring: '',
      bounce: '',
    },
    z: {
      hide: '',
      base: '',
      docked: '',
      dropdown: '',
      sticky: '',
      overlay: '',
      modal: '',
      popover: '',
      toast: '',
      tooltip: '',
    },
  },
  (_value, path) => `cynosure-${toCssName(path as string[])}`,
);

export type Vars = typeof vars;

/**
 * Global focus/press reset, shared by every component.
 *
 * Cynosure draws its own rounded, on-brand focus ring — a box-shadow keyed to
 * `:focus-visible` (see `focusRing`). The browser's *native* focus outline is a
 * separate, sharp-cornered rectangle (blue in Blink/WebKit) that UAs paint on
 * plain `:focus`, so it flashes whenever a clickable element is pressed with a
 * mouse, pen, or touch — duplicating and clashing with the design-system ring.
 *
 * These rules drop that native artefact on *pointer* interaction while leaving
 * keyboard accessibility intact:
 *
 * - `:focus:not(:focus-visible)` matches focus the UA decided is **not**
 *   keyboard-driven (i.e. a press). Removing the outline only there keeps a
 *   visible focus indicator for keyboard users, so WCAG 2.4.7 still holds.
 * - The WebKit/Blink tap-highlight is the translucent blue/grey wash painted
 *   over a tapped control on touch; each component supplies its own pressed
 *   feedback, so the default wash is cleared.
 *
 * Lives here (rather than a standalone reset module) because `vars.css.ts` is
 * imported by virtually every component stylesheet and is always retained by
 * tree-shaking — so these `globalStyle` rules reliably dedupe into the shared
 * `core.css` baseline that every component entry imports, with no per-component
 * opt-in.
 */
globalStyle(':focus:not(:focus-visible)', {
  outline: 'none',
});

// Kill the WebKit/Blink tap-highlight wash *everywhere*. It's an inherited
// property, so setting it on the root covers every element — list options,
// accordion headers, chevron buttons, table rows, etc. — not just a hand-listed
// set of tags. Components supply their own pressed/hover/active feedback, so the
// default blue/grey flash on click or tap is never wanted.
globalStyle('html', {
  WebkitTapHighlightColor: 'transparent',
});

// Clicking (or double-/drag-clicking) an interactive control shouldn't paint a
// blue text-selection highlight over its label — you can't usefully select the
// text of a button, tab, or option. Components built on a native `<button>`
// already opt out, but those that re-base with `all: unset` (which resets
// user-select back to `text`) set it themselves; this covers the rest.
globalStyle(
  [
    'button',
    'summary',
    '[role="button"]',
    '[role="tab"]',
    '[role="option"]',
    '[role="menuitem"]',
    '[role="menuitemcheckbox"]',
    '[role="menuitemradio"]',
    '[role="switch"]',
    '[role="radio"]',
    '[role="checkbox"]',
  ].join(', '),
  {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
);
