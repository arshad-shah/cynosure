import { style } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

export const timePopover = style({
  background: vars.color.background.raised,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.xl,
  overflow: 'hidden',
  padding: vars.space['2'],
  minWidth: 'unset',
  maxHeight: 'unset',
});

export const wheelColumns = style({
  display: 'grid',
  gap: vars.space['2'],
  padding: vars.space['1'],
});

export const wheelColumnsThree = style([wheelColumns, { gridTemplateColumns: '1fr 1fr 1fr' }]);
export const wheelColumnsTwo = style([wheelColumns, { gridTemplateColumns: '1fr 1fr' }]);

export const wheelColumn = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
});

export const wheelLabel = style({
  fontSize: '0.625rem',
  fontWeight: 600,
  color: vars.color.foreground.subtle,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
});

export const wheelList = style({
  height: '10rem',
  width: '100%',
  overflowY: 'auto',
  scrollSnapType: 'y mandatory',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  paddingBlock: '3.5rem',
  WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 20%, #000 80%, transparent 100%)',
  maskImage: 'linear-gradient(180deg, transparent 0%, #000 20%, #000 80%, transparent 100%)',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const wheelItem = style({
  scrollSnapAlign: 'center',
  flexShrink: 0,
  minHeight: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 12px',
  borderRadius: vars.radius.sm,
  fontSize: '0.875rem',
  fontWeight: 500,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  transitionProperty: 'background-color, color, transform',
  transitionDuration: vars.duration.fast,
  background: 'transparent',
  border: 'none',
  fontFamily: 'inherit',
  selectors: {
    '&:hover': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solidHover,
    },
    '&[data-selected="true"]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
      fontWeight: 600,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
  },
});
