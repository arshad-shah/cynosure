import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const tooltipIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.96)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

const tooltipOut = keyframes({
  from: { opacity: 1, transform: 'scale(1)' },
  to: { opacity: 0, transform: 'scale(0.96)' },
});

export const tooltipContent = style({
  background: vars.color.background.inverse,
  color: vars.color.foreground.inverse,
  padding: `${vars.space['1']} ${vars.space['2']}`,
  borderRadius: vars.radius.sm,
  fontSize: 'var(--cynosure-font-body-sm-size)',
  lineHeight: 'var(--cynosure-font-body-sm-line-height)',
  maxWidth: 'min(20rem, calc(100vw - 1rem))',
  boxShadow: vars.shadow.md,
  zIndex: Number(vars.z.tooltip),
  userSelect: 'none',
  selectors: {
    '&[data-state="delayed-open"], &[data-state="instant-open"]': {
      animation: `${tooltipIn} ${vars.duration.fast} ${vars.easing.easeOut}`,
    },
    '&[data-state="closed"]': {
      animation: `${tooltipOut} ${vars.duration.fast} ${vars.easing.easeIn}`,
    },
  },
});

export const tooltipArrow = style({
  fill: vars.color.background.inverse,
});
