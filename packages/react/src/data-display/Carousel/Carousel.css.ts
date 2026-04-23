import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Carousel root. `position: relative` anchors the prev/next buttons; the
 * viewport inside handles the actual scrolling, so any sibling controls can
 * render outside the overflow clip.
 */
export const carouselRoot = style({
  position: 'relative',
  width: '100%',
  outline: 'none',
  selectors: {
    '&[data-orientation="vertical"]': {
      display: 'flex',
      flexDirection: 'column',
    },
  },
});

/** Overflow-hidden window — Embla reads its width to measure slide offsets. */
export const carouselViewport = style({
  overflow: 'hidden',
  width: '100%',
  borderRadius: vars.radius.lg,
});

/** Track that holds all slides in a flexbox row (or column). */
export const carouselContainer = style({
  display: 'flex',
  touchAction: 'pan-y',
  marginInline: `calc(${vars.space['3']} * -1)`,
  selectors: {
    [`${carouselRoot}[data-orientation="vertical"] &`]: {
      flexDirection: 'column',
      touchAction: 'pan-x',
      marginInline: 0,
      marginBlock: `calc(${vars.space['3']} * -1)`,
    },
  },
});

/**
 * One slide. The default `flex: 0 0 100%` makes a 1-up carousel; set
 * `slidesPerView` (or a custom `flexBasis`) to show more.
 */
export const carouselSlide = style({
  flex: '0 0 100%',
  minWidth: 0,
  paddingInline: vars.space['3'],
  selectors: {
    [`${carouselRoot}[data-orientation="vertical"] &`]: {
      paddingInline: 0,
      paddingBlock: vars.space['3'],
    },
  },
});

/** Shared button base (prev + next). Positioned against the viewport edges. */
const controlBase = style({
  position: 'absolute',
  top: '50%',
  width: '2.5rem',
  height: '2.5rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: vars.color.background.raised,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.full,
  boxShadow: vars.shadow.md,
  cursor: 'pointer',
  transitionProperty: 'background-color, color, transform, box-shadow, opacity',
  transitionDuration: vars.duration.fast,
  outline: 'none',
  zIndex: 1,
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.color.accent.soft,
      borderColor: vars.color.accent.solid,
      color: vars.color.accent.solid,
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}, ${vars.shadow.md}`,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
    [`${carouselRoot}[data-orientation="vertical"] &`]: {
      top: 'auto',
      left: '50%',
    },
  },
});

export const carouselPrev = style([
  controlBase,
  {
    left: 0,
    transform: 'translate(-50%, -50%)',
    selectors: {
      [`${carouselRoot}[data-orientation="vertical"] &`]: {
        left: '50%',
        top: 0,
        transform: 'translate(-50%, -50%) rotate(90deg)',
      },
    },
  },
]);

export const carouselNext = style([
  controlBase,
  {
    right: 0,
    transform: 'translate(50%, -50%)',
    selectors: {
      [`${carouselRoot}[data-orientation="vertical"] &`]: {
        top: '100%',
        left: '50%',
        right: 'auto',
        transform: 'translate(-50%, -50%) rotate(90deg)',
      },
    },
  },
]);

export const carouselDots = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: vars.space['1.5'],
  marginTop: vars.space['3'],
  selectors: {
    [`${carouselRoot}[data-orientation="vertical"] &`]: {
      marginTop: 0,
      marginLeft: vars.space['3'],
      flexDirection: 'column',
    },
  },
});

export const carouselDot = style({
  width: '0.5rem',
  height: '0.5rem',
  padding: 0,
  borderRadius: vars.radius.full,
  background: vars.color.border.default,
  border: 'none',
  cursor: 'pointer',
  transitionProperty: 'background-color, width, box-shadow',
  transitionDuration: vars.duration.fast,
  outline: 'none',
  selectors: {
    '&[data-active="true"]': {
      background: vars.color.accent.solid,
      width: '1.25rem',
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&:hover:not([data-active="true"])': {
      background: vars.color.foreground.muted,
    },
  },
});
