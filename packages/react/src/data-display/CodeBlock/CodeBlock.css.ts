import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const codeBlockRoot = style({
  position: 'relative',
  background: vars.color.background.muted,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  fontSize: 'var(--lumen-font-body-sm-size)',
  color: vars.color.foreground.default,
  overflow: 'hidden',
});

export const codeBlockHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['2'],
  paddingBlock: vars.space['1'],
  paddingInline: vars.space['3'],
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  fontSize: 'var(--lumen-font-body-xs-size, 0.75rem)',
  color: vars.color.foreground.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontVariantNumeric: 'tabular-nums',
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
  fontSize: 'var(--lumen-font-body-xs-size, 0.75rem)',
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
  maxHeight: 'var(--lumen-code-max-height, none)',
});

export const codeBlockPre = style({
  margin: 0,
  padding: vars.space['3'],
  fontFamily:
    'var(--lumen-font-code-family, ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Roboto Mono", monospace)',
  fontSize: 'var(--lumen-font-code-size, 0.8125rem)',
  lineHeight: 1.6,
  whiteSpace: 'pre',
  tabSize: 2,
});

export const codeBlockLine = style({
  display: 'inline-block',
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
