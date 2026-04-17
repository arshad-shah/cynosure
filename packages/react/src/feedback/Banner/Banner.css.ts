import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const bannerRoot = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  width: '100%',
  borderRadius: 0,
  borderInline: 'none',
  paddingBlock: vars.space['3'],
  paddingInline: vars.space['4'],
  boxSizing: 'border-box',
});

export const bannerSize = styleVariants({
  sm: { paddingBlock: vars.space['2'], fontSize: 'var(--lumen-font-body-sm-size)' },
  md: { paddingBlock: vars.space['3'] },
  lg: { paddingBlock: vars.space['4'] },
});

export const bannerContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
  flex: '1 1 auto',
  minWidth: 0,
});

export const bannerActions = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  flex: '0 0 auto',
});
