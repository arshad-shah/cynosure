import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const timelineRoot = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
  listStyle: 'none',
  margin: 0,
  padding: 0,
  selectors: {
    '&[data-orientation="horizontal"]': {
      flexDirection: 'row',
    },
  },
});

export const timelineSize = styleVariants({
  sm: { vars: { '--lumen-tl-dot': '0.5rem', '--lumen-tl-line': '2px' } },
  md: { vars: { '--lumen-tl-dot': '0.75rem', '--lumen-tl-line': '2px' } },
  lg: { vars: { '--lumen-tl-dot': '1rem', '--lumen-tl-line': '2.5px' } },
});

export const timelineItem = style({
  display: 'flex',
  gap: vars.space['3'],
  alignItems: 'stretch',
  minWidth: 0,
  selectors: {
    '[data-orientation="horizontal"] &': {
      flexDirection: 'column',
      flex: '1 1 0',
    },
  },
});

export const timelineSeparator = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: '0 0 auto',
  selectors: {
    '[data-orientation="horizontal"] &': {
      flexDirection: 'row',
    },
  },
});

export const timelineDot = style({
  width: 'var(--lumen-tl-dot, 0.75rem)',
  height: 'var(--lumen-tl-dot, 0.75rem)',
  borderRadius: vars.radius.full,
  background: vars.color.accent.solid,
  border: `2px solid ${vars.color.background.surface}`,
  boxShadow: `0 0 0 2px ${vars.color.border.subtle}`,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.accent.onSolid,
  flex: '0 0 auto',
  selectors: {
    '&[data-variant="outline"]': {
      background: vars.color.background.surface,
      border: '2px solid currentColor',
      boxShadow: 'none',
    },
    '&[data-color="success"]': {
      background: vars.color.feedback.success.solid,
      color: vars.color.feedback.success.foreground,
    },
    '&[data-color="warning"]': {
      background: vars.color.feedback.warning.solid,
      color: vars.color.feedback.warning.foreground,
    },
    '&[data-color="danger"]': {
      background: vars.color.feedback.danger.solid,
      color: vars.color.feedback.danger.foreground,
    },
    '&[data-color="info"]': {
      background: vars.color.feedback.info.solid,
      color: vars.color.feedback.info.foreground,
    },
    '&[data-color="neutral"]': {
      background: vars.color.foreground.muted,
      color: vars.color.background.surface,
    },
  },
});

export const timelineConnector = style({
  width: 'var(--lumen-tl-line, 2px)',
  flex: '1 1 auto',
  background: vars.color.border.subtle,
  minHeight: vars.space['3'],
  selectors: {
    '[data-orientation="horizontal"] &': {
      width: 'auto',
      height: 'var(--lumen-tl-line, 2px)',
      minHeight: 0,
      minWidth: vars.space['3'],
    },
  },
});

export const timelineContent = style({
  flex: '1 1 auto',
  minWidth: 0,
  paddingBottom: vars.space['3'],
  selectors: {
    '[data-orientation="horizontal"] &': {
      paddingBottom: 0,
    },
  },
});
