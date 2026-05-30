import { style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

export const cardRoot = style({
  display: 'flex',
  flexDirection: 'column',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
  minWidth: 0,
  selectors: {
    '&[data-orientation="horizontal"]': {
      flexDirection: 'row',
    },
  },
});

export const cardVariantOutlined = style({
  border: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.surface,
});

export const cardVariantElevated = style({
  border: 'none',
  background: vars.color.background.surface,
  boxShadow: vars.shadow.md,
});

export const cardVariantFilled = style({
  border: 'none',
  background: vars.color.background.muted,
});

export const cardVariantGhost = style({
  border: 'none',
  background: 'transparent',
});

export const cardVariant = styleVariants({
  outlined: [cardVariantOutlined],
  elevated: [cardVariantElevated],
  filled: [cardVariantFilled],
  ghost: [cardVariantGhost],
});

export const cardPaddingSize = styleVariants({
  sm: { vars: { '--cynosure-card-pad': vars.space['3'] } },
  md: { vars: { '--cynosure-card-pad': vars.space['4'] } },
  lg: { vars: { '--cynosure-card-pad': vars.space['6'] } },
});

export const cardInteractive = style({
  cursor: 'pointer',
  transitionProperty: 'box-shadow, transform, border-color, background',
  transitionDuration: vars.duration.normal,
  transitionTimingFunction: vars.easing.easeOut,
  selectors: {
    '&:hover': {
      boxShadow: vars.shadow.lg,
      borderColor: vars.color.border.strong,
      transform: 'translateY(-2px)',
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
    '&:active': {
      transform: 'translateY(0) scale(0.99)',
      transitionDuration: vars.duration.fast,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const cardHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1'],
  padding: `var(--cynosure-card-pad, ${vars.space['4']})`,
});

export const cardBody = style({
  flex: '1 1 auto',
  padding: `var(--cynosure-card-pad, ${vars.space['4']})`,
  selectors: {
    [`.${cardHeader} + &`]: {
      paddingTop: 0,
    },
  },
});

export const cardFooter = style({
  display: 'flex',
  gap: vars.space['2'],
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: `var(--cynosure-card-pad, ${vars.space['4']})`,
  selectors: {
    [`.${cardBody} + &`]: {
      paddingTop: 0,
    },
  },
});

export const cardTitle = style({
  margin: 0,
  fontFamily: 'var(--cynosure-font-heading-3-family)',
  fontSize: 'var(--cynosure-font-heading-3-size)',
  fontWeight: 'var(--cynosure-font-heading-3-weight)',
  lineHeight: 'var(--cynosure-font-heading-3-line-height)',
  color: vars.color.foreground.default,
});

export const cardDescription = style({
  margin: 0,
  fontSize: 'var(--cynosure-font-body-sm-size)',
  color: vars.color.foreground.muted,
});

export const cardImageWrap = style({
  display: 'block',
  width: '100%',
  overflow: 'hidden',
  background: vars.color.background.subtle,
});

export const cardImage = style({
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const cardHorizontalImage = style({
  width: '40%',
  flex: '0 0 auto',
  height: 'auto',
});
