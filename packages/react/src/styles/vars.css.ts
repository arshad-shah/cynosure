import { baseTokens } from '@arshad-shah/cynosure-tokens';
import { createGlobalThemeContract, globalStyle } from '@vanilla-extract/css';
import { toCssName } from './tokenPath.js';

/**
 * Typed mirror of the `@arshad-shah/cynosure-tokens` CSS custom properties.
 *
 * The contract is **generated from the published token tree** (`baseTokens`)
 * rather than hand-maintained, so it can never drift: every `--cynosure-*`
 * custom property the tokens package emits is typed here, and nothing else.
 * (`vars.parity.test.ts` guards the invariant.) The contract types only the
 * names — consumers import `@arshad-shah/cynosure-tokens/css` for the values
 * (the provider does this for you). Referencing e.g. `vars.color.accent.solid`
 * inside a `.css.ts` file emits `var(--cynosure-color-accent-solid)` at build
 * time.
 *
 * The shared `toCssName` mapper (`./tokenPath`) reproduces Style Dictionary's
 * `name/kebab` transform exactly — walking `baseTokens` reproduces all the
 * generated var names with zero diff — so the contract stays a faithful
 * reflection of the token CSS, and `defineTheme` resolves identical names.
 */

/** Kebab token key → camelCase JS accessor (`ease-in` → `easeIn`). */
type CamelKey<S extends string> = S extends `${infer H}-${infer T}`
  ? `${H}${Capitalize<CamelKey<T>>}`
  : S;

/**
 * The token tree with every leaf replaced by `''` and every kebab key
 * camelCased for ergonomic access — preserving shape. Camel-casing keys is
 * cosmetic for JS (`vars.easing.easeIn`): it never changes the emitted var
 * name, because `toCssName` re-expands camelCase back to the original kebab.
 */
type LeafString<T> = T extends readonly unknown[]
  ? string
  : T extends object
    ? { [K in keyof T as CamelKey<K & string>]: LeafString<T[K]> }
    : string;

const camelKey = (key: string): string => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const emptyLeaves = <T>(node: T): LeafString<T> => {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(node as object)) {
      out[camelKey(key)] = emptyLeaves((node as Record<string, unknown>)[key]);
    }
    return out as LeafString<T>;
  }
  return '' as LeafString<T>;
};

export const vars = createGlobalThemeContract(
  emptyLeaves(baseTokens),
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
