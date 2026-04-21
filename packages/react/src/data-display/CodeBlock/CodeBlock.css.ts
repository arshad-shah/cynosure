import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/* ========================================================================
 * CodeBlock — built fresh on DS tokens.
 *
 * Visual: a surface-colored card with a subtly-tinted header, divided from
 * the code area by a hairline. Shiki's theme BG is stripped so the code
 * surface stays consistent with the rest of the DS — only per-token colors
 * come from Shiki. That's what lets the same component work in light and
 * dark without a jarring nested panel.
 * ===================================================================== */

/* ---------- Root card ---------- */

export const codeBlockRoot = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  overflow: 'hidden',
  fontSize: 'var(--cynosure-font-body-sm-size)',
});

/* ---------- Header (filename / language + copy) ---------- */

export const codeBlockHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['3'],
  paddingInline: vars.space['3'],
  paddingBlock: vars.space['2'],
  background: vars.color.background.subtle,
  borderBottom: `1px solid ${vars.color.border.subtle}`,
});

export const codeBlockLabel = style({
  fontFamily:
    'var(--cynosure-font-code-family, ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Roboto Mono", monospace)',
  fontSize: 'var(--cynosure-font-body-xs-size, 0.75rem)',
  fontWeight: 500,
  color: vars.color.foreground.muted,
  lineHeight: 1.4,
});

export const codeBlockCopyButton = style({
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  paddingInline: vars.space['2'],
  paddingBlock: '0.125rem',
  borderRadius: vars.radius.sm,
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  fontSize: 'var(--cynosure-font-body-xs-size, 0.75rem)',
  fontWeight: 500,
  transition: `background-color ${vars.duration.fast} ease, color ${vars.duration.fast} ease`,
  selectors: {
    '&:hover': {
      background: vars.color.background.muted,
      color: vars.color.foreground.default,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.accent.ring}`,
      outlineOffset: '1px',
    },
  },
});

/* ---------- Scroll region + scrollbar ---------- */

export const codeBlockScroll = style({
  overflow: 'auto',
  maxHeight: 'var(--cynosure-code-max-height, none)',
  // Inherit the card's radius so scrollbars + content stay bounded by the
  // rounded corners (no sharp corners peeking under the header divider).
  borderRadius: 'inherit',
  scrollbarWidth: 'thin',
  scrollbarColor: `${vars.color.border.default} transparent`,
});

globalStyle(`${codeBlockScroll}::-webkit-scrollbar`, {
  width: '10px',
  height: '10px',
});
globalStyle(`${codeBlockScroll}::-webkit-scrollbar-track`, {
  background: 'transparent',
});
globalStyle(`${codeBlockScroll}::-webkit-scrollbar-thumb`, {
  background: vars.color.border.default,
  // Subtle inset — border matches the card bg, so the thumb looks centred.
  border: `2px solid ${vars.color.background.surface}`,
  borderRadius: '10px',
});
globalStyle(`${codeBlockScroll}::-webkit-scrollbar-thumb:hover`, {
  background: vars.color.border.strong,
});
globalStyle(`${codeBlockScroll}::-webkit-scrollbar-corner`, {
  background: 'transparent',
});

/* ---------- Pre / code ---------- */

export const codeBlockPre = style({
  margin: 0,
  // Flush by default so the line-number gutter can butt against the wrapper.
  // The `:not([data-line-numbers])` rule below restores breathing room when
  // there's no gutter to carry the inset.
  padding: 0,
  borderRadius: 'inherit',
  fontFamily:
    'var(--cynosure-font-code-family, ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Roboto Mono", monospace)',
  fontSize: 'var(--cynosure-font-code-size, 0.8125rem)',
  lineHeight: 1.7,
  whiteSpace: 'pre',
  tabSize: 2,
});

export const codeBlockLine = style({
  display: 'block',
  width: '100%',
  selectors: {
    // With the pre flush to the card, the highlight naturally spans full
    // width — no negative-margin bleed needed.
    '&[data-highlighted="true"]': {
      background: vars.color.accent.soft,
      boxShadow: `inset 2px 0 0 ${vars.color.accent.solid}`,
    },
  },
});

/* Without the line-number gutter the code hugs the card edges too tightly —
 * add real padding. Highlight bleed below keeps full-width stripes. */
globalStyle(`${codeBlockRoot}:not([data-line-numbers="true"]) ${codeBlockPre}`, {
  padding: vars.space['4'],
});
globalStyle(
  `${codeBlockRoot}:not([data-line-numbers="true"]) ${codeBlockLine}[data-highlighted="true"]`,
  {
    marginInline: `calc(-1 * ${vars.space['4']})`,
    paddingInline: vars.space['4'],
  },
);
globalStyle(
  `${codeBlockRoot}:not([data-line-numbers="true"]) ${codeBlockPre} .line[data-highlighted="true"]`,
  {
    marginInline: `calc(-1 * ${vars.space['4']})`,
    paddingInline: vars.space['4'],
  },
);

export const codeBlockLineNumber = style({
  display: 'inline-block',
  width: '2.5ch',
  paddingInlineEnd: vars.space['2'],
  marginInlineEnd: vars.space['3'],
  borderInlineEnd: `1px solid ${vars.color.border.subtle}`,
  color: vars.color.foreground.subtle,
  textAlign: 'end',
  userSelect: 'none',
  fontVariantNumeric: 'tabular-nums',
});

/* Horizontal divider between each line number — second-and-later rows only
 * so the first row doesn't gain a stray border at the top of the gutter. */
globalStyle(`${codeBlockLine} + ${codeBlockLine} > ${codeBlockLineNumber}`, {
  borderTop: `1px solid ${vars.color.border.subtle}`,
});

/* ========================================================================
 * Shiki output normalization
 * ===================================================================== */

/**
 * Shiki wraps its output in `<pre class="shiki"><code>…`. Strip its chrome
 * (padding, bg, font) so the surrounding pre owns layout and our DS card bg
 * shows through. The `!important` on `background` is the one override
 * needed because Shiki sets the bg inline in single-theme mode.
 */
globalStyle(`${codeBlockPre} pre.shiki`, {
  margin: 0,
  padding: 0,
  background: 'transparent !important',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  tabSize: 'inherit',
  whiteSpace: 'inherit',
});

/**
 * `<code>` inside Shiki output gets `white-space: normal` so the literal `\n`s
 * Shiki emits between line spans collapse. Each `.line` then re-asserts
 * `white-space: pre` to keep in-line indentation. Without this, line spans
 * (which are `display: block`) render with a visible blank row between them.
 */
globalStyle(`${codeBlockPre} pre.shiki code`, {
  display: 'block',
  whiteSpace: 'normal',
});

globalStyle(`${codeBlockPre} .line`, {
  display: 'block',
  minWidth: '100%',
  whiteSpace: 'pre',
});

globalStyle(`${codeBlockPre} .line[data-highlighted="true"]`, {
  background: vars.color.accent.soft,
  boxShadow: `inset 2px 0 0 ${vars.color.accent.solid}`,
});

/**
 * Line numbers for Shiki-rendered output. Enabled by `data-line-numbers` on
 * the root; uses a CSS counter instead of DOM nodes so we don't have to
 * post-process Shiki's HTML. Plain-mode line numbers are rendered by the
 * component directly and keep their own styling.
 */
globalStyle(`[data-line-numbers="true"] ${codeBlockPre} pre.shiki code`, {
  counterReset: 'cynosure-code-line',
});
globalStyle(`[data-line-numbers="true"] ${codeBlockPre} pre.shiki .line::before`, {
  counterIncrement: 'cynosure-code-line',
  content: 'counter(cynosure-code-line)',
  display: 'inline-block',
  width: '2.5ch',
  paddingInlineEnd: vars.space['2'],
  marginInlineEnd: vars.space['3'],
  borderInlineEnd: `1px solid ${vars.color.border.subtle}`,
  color: vars.color.foreground.subtle,
  textAlign: 'end',
  userSelect: 'none',
  fontVariantNumeric: 'tabular-nums',
});

/* Horizontal divider between line numbers in Shiki mode (skip the first). */
globalStyle(`[data-line-numbers="true"] ${codeBlockPre} pre.shiki .line + .line::before`, {
  borderTop: `1px solid ${vars.color.border.subtle}`,
});

/* ========================================================================
 * Dual-theme token colors
 *
 * Shiki's `defaultColor: false` output puts `--shiki-light` / `--shiki-dark`
 * on every token (no inline `color`). These rules pick one based on the
 * active Cynosure theme (`data-theme="dark"` from ThemeProvider), with a
 * `prefers-color-scheme` fallback for provider-less renders.
 *
 * We intentionally do NOT consume `--shiki-light-bg` / `--shiki-dark-bg` —
 * the card's own DS background fills the code area in both themes.
 * ===================================================================== */

globalStyle(`${codeBlockPre} pre.shiki, ${codeBlockPre} pre.shiki span`, {
  color: 'var(--shiki-light, inherit)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: 'var(--shiki-dark, inherit)',
    },
  },
});

globalStyle(
  `[data-theme="light"] ${codeBlockPre} pre.shiki, [data-theme="light"] ${codeBlockPre} pre.shiki span`,
  {
    color: 'var(--shiki-light, inherit)',
  },
);

globalStyle(
  `[data-theme="dark"] ${codeBlockPre} pre.shiki, [data-theme="dark"] ${codeBlockPre} pre.shiki span`,
  {
    color: 'var(--shiki-dark, inherit)',
  },
);
