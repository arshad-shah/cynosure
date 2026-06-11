import { globalStyle, keyframes, style, styleVariants } from '@vanilla-extract/css';
import { focusRingInset } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
});

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
});

export const accordionRoot = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  selectors: {
    '&[data-variant="default"]': {
      // separators between items only
    },
    '&[data-variant="contained"]': {
      border: `1px solid ${vars.color.border.default}`,
      borderRadius: vars.radius.md,
      overflow: 'hidden',
      background: vars.color.background.surface,
    },
    '&[data-variant="ghost"]': {},
  },
});

export const accordionItem = style({
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
    '[data-variant="ghost"] &': {
      borderBottom: 'none',
    },
  },
});

export const accordionHeader = style({
  display: 'flex',
  margin: 0,
});

export const accordionTrigger = style({
  all: 'unset',
  boxSizing: 'border-box',
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['2'],
  paddingBlock: `var(--cynosure-acc-pad-y, ${vars.space['3']})`,
  paddingInline: `var(--cynosure-acc-pad-x, ${vars.space['4']})`,
  fontFamily: vars.font.body.md.family,
  fontSize: vars.font.body.md.size,
  fontWeight: 600,
  color: vars.color.foreground.default,
  cursor: 'pointer',
  userSelect: 'none',
  textAlign: 'start',
  transition: `background ${vars.duration.fast} ${vars.easing.easeInOut}`,
  selectors: {
    '&:hover': { background: vars.color.background.subtle },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRingInset,
    },
    '&[data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const accordionChevron = style({
  display: 'inline-flex',
  transition: `transform ${vars.duration.fast} ${vars.easing.easeInOut}`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

globalStyle(`${accordionTrigger}[data-state="open"] ${accordionChevron}`, {
  transform: 'rotate(180deg)',
});

export const accordionContent = style({
  overflow: 'hidden',
  fontSize: vars.font.body.md.size,
  color: vars.color.foreground.default,
  selectors: {
    '&[data-state="open"]': {
      animation: `${slideDown} ${vars.duration.normal} ${vars.easing.easeInOut}`,
    },
    '&[data-state="closed"]': {
      animation: `${slideUp} ${vars.duration.normal} ${vars.easing.easeInOut}`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        '&[data-state="open"], &[data-state="closed"]': {
          animation: 'none',
        },
      },
    },
  },
});

export const accordionContentInner = style({
  paddingBlock: vars.space['2'],
  paddingInline: `var(--cynosure-acc-pad-x, ${vars.space['4']})`,
  paddingBottom: vars.space['3'],
});

export const accordionSize = styleVariants({
  sm: {
    vars: { '--cynosure-acc-pad-y': vars.space['2'], '--cynosure-acc-pad-x': vars.space['3'] },
  },
  md: {
    vars: { '--cynosure-acc-pad-y': vars.space['3'], '--cynosure-acc-pad-x': vars.space['4'] },
  },
  lg: {
    vars: { '--cynosure-acc-pad-y': vars.space['4'], '--cynosure-acc-pad-x': vars.space['5'] },
  },
});
