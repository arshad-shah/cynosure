import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const numberInputGroup = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
});

export const numberInputField = style({
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  paddingBlock: vars.space['1'],
});

export const numberInputSteppers = style({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'stretch',
  borderInlineStart: `1px solid ${vars.color.border.subtle}`,
});

export const numberInputStepper = style({
  flex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '1.5rem',
  paddingInline: vars.space['1'],
  border: 'none',
  background: 'transparent',
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.color.background.subtle,
      color: vars.color.foreground.default,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    '&:not(:first-child)': {
      borderBlockStart: `1px solid ${vars.color.border.subtle}`,
    },
  },
});
