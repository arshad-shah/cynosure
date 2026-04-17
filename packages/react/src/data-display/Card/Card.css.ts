import { style, styleVariants } from '@vanilla-extract/css';
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
  sm: { vars: { '--lumen-card-pad': vars.space['3'] } },
  md: { vars: { '--lumen-card-pad': vars.space['4'] } },
  lg: { vars: { '--lumen-card-pad': vars.space['6'] } },
});

export const cardInteractive = style({
  cursor: 'pointer',
  transition: `box-shadow ${vars.duration.fast} ease, transform ${vars.duration.fast} ease, border-color ${vars.duration.fast} ease, background ${vars.duration.fast} ease`,
  selectors: {
    '&:hover': {
      boxShadow: vars.shadow.lg,
      borderColor: vars.color.border.strong,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${vars.color.accent.ring}`,
    },
    '&:active': {
      transform: 'translateY(1px)',
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
  padding: `var(--lumen-card-pad, ${vars.space['4']})`,
});

export const cardBody = style({
  flex: '1 1 auto',
  padding: `var(--lumen-card-pad, ${vars.space['4']})`,
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
  padding: `var(--lumen-card-pad, ${vars.space['4']})`,
  selectors: {
    [`.${cardBody} + &`]: {
      paddingTop: 0,
    },
  },
});

export const cardTitle = style({
  margin: 0,
  fontFamily: 'var(--lumen-font-heading-3-family)',
  fontSize: 'var(--lumen-font-heading-3-size)',
  fontWeight: 'var(--lumen-font-heading-3-weight)',
  lineHeight: 'var(--lumen-font-heading-3-line-height)',
  color: vars.color.foreground.default,
});

export const cardDescription = style({
  margin: 0,
  fontSize: 'var(--lumen-font-body-sm-size)',
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
