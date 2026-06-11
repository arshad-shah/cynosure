import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const tableRoot = style({
  width: '100%',
  borderCollapse: 'collapse',
  borderSpacing: 0,
  fontFamily: vars.font.body.md.family,
  fontSize: vars.font.body.sm.size,
  color: vars.color.foreground.default,
  selectors: {
    '&[data-layout="fixed"]': {
      tableLayout: 'fixed',
    },
    '&[data-layout="auto"]': {
      tableLayout: 'auto',
    },
  },
});

export const tableSize = styleVariants({
  sm: {
    vars: { '--cynosure-tbl-pad-y': vars.space['1'], '--cynosure-tbl-pad-x': vars.space['2'] },
  },
  md: {
    vars: { '--cynosure-tbl-pad-y': vars.space['2'], '--cynosure-tbl-pad-x': vars.space['3'] },
  },
  lg: {
    vars: { '--cynosure-tbl-pad-y': vars.space['3'], '--cynosure-tbl-pad-x': vars.space['4'] },
  },
});

export const tableVariantLine = style({});
export const tableVariantStriped = style({});
export const tableVariantGrid = style({});
export const tableVariantMinimal = style({});

export const tableVariant = styleVariants({
  line: [tableVariantLine],
  striped: [tableVariantStriped],
  grid: [tableVariantGrid],
  minimal: [tableVariantMinimal],
});

export const tableStickyHeader = style({});

export const tableHead = style({
  color: vars.color.foreground.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  fontSize: 'var(--cynosure-font-body-xs-size, 0.75rem)',
  fontWeight: 600,
  selectors: {
    [`.${tableStickyHeader} &`]: {
      position: 'sticky',
      top: 0,
      background: vars.color.background.surface,
      zIndex: 1,
    },
  },
});

export const tableBody = style({});

export const tableFoot = style({
  color: vars.color.foreground.muted,
});

export const tableRow = style({
  selectors: {
    [`.${tableVariantStriped} tbody &:nth-of-type(odd)`]: {
      background: vars.color.background.subtle,
    },
    [`.${tableVariantLine} tbody &`]: {
      borderBottom: `1px solid ${vars.color.border.subtle}`,
    },
    [`.${tableVariantGrid} tbody &`]: {
      borderBottom: `1px solid ${vars.color.border.subtle}`,
    },
  },
});

export const tableHeader = style({
  textAlign: 'start',
  paddingBlock: 'var(--cynosure-tbl-pad-y)',
  paddingInline: 'var(--cynosure-tbl-pad-x)',
  whiteSpace: 'nowrap',
  borderBottom: `1px solid ${vars.color.border.default}`,
  selectors: {
    '&[data-align="start"]': { textAlign: 'start' },
    '&[data-align="center"]': { textAlign: 'center' },
    '&[data-align="end"]': { textAlign: 'end' },
    [`.${tableVariantGrid} &`]: {
      borderInlineEnd: `1px solid ${vars.color.border.subtle}`,
    },
    [`.${tableVariantGrid} &:last-child`]: {
      borderInlineEnd: 'none',
    },
  },
});

export const tableCell = style({
  paddingBlock: 'var(--cynosure-tbl-pad-y)',
  paddingInline: 'var(--cynosure-tbl-pad-x)',
  verticalAlign: 'middle',
  selectors: {
    '&[data-align="start"]': { textAlign: 'start' },
    '&[data-align="center"]': { textAlign: 'center' },
    '&[data-align="end"]': { textAlign: 'end' },
    '&[data-numeric="true"]': { fontVariantNumeric: 'tabular-nums' },
    [`.${tableVariantGrid} &`]: {
      borderInlineEnd: `1px solid ${vars.color.border.subtle}`,
    },
    [`.${tableVariantGrid} &:last-child`]: {
      borderInlineEnd: 'none',
    },
  },
});

export const tableCaption = style({
  captionSide: 'bottom',
  color: vars.color.foreground.muted,
  padding: vars.space['2'],
  fontSize: vars.font.body.sm.size,
  textAlign: 'start',
});
