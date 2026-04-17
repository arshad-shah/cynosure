import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const label = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  color: vars.color.foreground.default,
  fontSize: 'var(--lumen-font-body-sm-size)',
  lineHeight: 'var(--lumen-font-body-sm-line-height)',
  fontWeight: 'var(--lumen-font-weight-medium)',
  cursor: 'pointer',
  selectors: {
    '&[data-disabled="true"]': {
      color: vars.color.foreground.disabled,
      cursor: 'not-allowed',
    },
  },
});

export const labelRequiredIndicator = style({
  color: vars.color.feedback.danger.foreground,
  marginInlineStart: '2px',
});
