import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Outer card. Structural props (bg / border / radius) are owned by the `Box`
 * primitive in the component — this class carries only the non-LayoutProp
 * concerns (default text colour and base font size).
 */
export const codeBlockRoot = style({
  fontSize: 'var(--cynosure-font-body-sm-size)',
  color: vars.color.foreground.default,
});

/**
 * Header row. Layout is owned by `<Inline>`; this class adds the hairline
 * divider + muted label styling. No uppercase / letter-spacing — cleaner
 * default that plays well with monospace filenames.
 */
export const codeBlockHeader = style({
  gap: vars.space['2'],
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  fontSize: 'var(--cynosure-font-body-xs-size, 0.75rem)',
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
});

/** Language / filename label — tight monospace, no shouting. */
export const codeBlockLabel = style({
  fontFamily:
    'var(--cynosure-font-code-family, ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Roboto Mono", monospace)',
  fontSize: 'inherit',
  color: vars.color.foreground.muted,
});

export const codeBlockCopyButton = style({
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  paddingBlock: vars.space['0.5'],
  paddingInline: vars.space['1.5'],
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border.subtle}`,
  background: vars.color.background.surface,
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  transition: `background ${vars.duration.fast} ease`,
  fontSize: 'var(--cynosure-font-body-xs-size, 0.75rem)',
  selectors: {
    '&:hover': {
      background: vars.color.background.subtle,
      color: vars.color.foreground.default,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const codeBlockScroll = style({
  overflow: 'auto',
  maxHeight: 'var(--cynosure-code-max-height, none)',
  // Thin themed scrollbar — matches the Textarea treatment.
  scrollbarWidth: 'thin',
  scrollbarColor: `${vars.color.border.strong} transparent`,
});

// WebKit scrollbar to match the Firefox `scrollbar-width: thin` setting.
globalStyle(`${codeBlockScroll}::-webkit-scrollbar`, {
  width: '8px',
  height: '8px',
});
globalStyle(`${codeBlockScroll}::-webkit-scrollbar-track`, {
  background: 'transparent',
});
globalStyle(`${codeBlockScroll}::-webkit-scrollbar-thumb`, {
  background: vars.color.border.strong,
  borderRadius: '4px',
});
globalStyle(`${codeBlockScroll}::-webkit-scrollbar-thumb:hover`, {
  background: vars.color.foreground.muted,
});
globalStyle(`${codeBlockScroll}::-webkit-scrollbar-corner`, {
  background: 'transparent',
});

export const codeBlockPre = style({
  margin: 0,
  padding: vars.space['4'],
  fontFamily:
    'var(--cynosure-font-code-family, ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Roboto Mono", monospace)',
  fontSize: 'var(--cynosure-font-code-size, 0.8125rem)',
  lineHeight: 1.6,
  whiteSpace: 'pre',
  tabSize: 2,
});

/**
 * Shiki wraps its output in `<pre class="shiki"><code>…`. We strip its outer
 * `<pre>` chrome so our Box owns the padding/border, and then:
 *
 * - `<code>` uses `white-space: normal` — collapses the literal `\n`s Shiki
 *   emits between line spans, which otherwise appear as visible blank lines
 *   when `.line` is `display: block`.
 * - Each `.line` re-asserts `white-space: pre` so in-line indentation and
 *   spacing are preserved, and becomes `display: block` so the highlight
 *   stripe spans the full row.
 */
globalStyle(`${codeBlockPre} pre.shiki`, {
  margin: 0,
  padding: 0,
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  tabSize: 'inherit',
  whiteSpace: 'inherit',
});
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

/* ---------- Dual-theme token colors ----------
 *
 * Shiki's `defaultColor: false` output sets `--shiki-light`, `--shiki-light-bg`,
 * `--shiki-dark`, `--shiki-dark-bg` as inline CSS variables on every token.
 * The declarations below pick the right one based on the Cynosure theme
 * (`data-theme="dark"` set by `ThemeProvider`), with a `prefers-color-scheme`
 * fallback for pages rendered without the provider.
 */
globalStyle(`${codeBlockPre} pre.shiki, ${codeBlockPre} pre.shiki span`, {
  color: 'var(--shiki-light)',
  backgroundColor: 'var(--shiki-light-bg)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: 'var(--shiki-dark)',
      backgroundColor: 'var(--shiki-dark-bg)',
    },
  },
});
// Explicit theme attribute always wins over the media-query fallback.
globalStyle(
  `[data-theme="light"] ${codeBlockPre} pre.shiki, [data-theme="light"] ${codeBlockPre} pre.shiki span`,
  {
    color: 'var(--shiki-light)',
    backgroundColor: 'var(--shiki-light-bg)',
  },
);
globalStyle(
  `[data-theme="dark"] ${codeBlockPre} pre.shiki, [data-theme="dark"] ${codeBlockPre} pre.shiki span`,
  {
    color: 'var(--shiki-dark)',
    backgroundColor: 'var(--shiki-dark-bg)',
  },
);

export const codeBlockLine = style({
  display: 'block',
  width: '100%',
  selectors: {
    '&[data-highlighted="true"]': {
      background: vars.color.accent.soft,
      boxShadow: `inset 2px 0 0 ${vars.color.accent.solid}`,
    },
  },
});

export const codeBlockLineNumber = style({
  display: 'inline-block',
  width: '2.5ch',
  marginInlineEnd: vars.space['3'],
  color: vars.color.foreground.subtle,
  textAlign: 'end',
  userSelect: 'none',
  fontVariantNumeric: 'tabular-nums',
});
