// packages/react/src/navigation/Sidebar/Sidebar.css.ts
import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const sidebarRoot = style({
  display: 'flex',
  flexDirection: 'column',
  width: '16rem',
  minWidth: '16rem',
  height: '100%',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  borderInlineEnd: `1px solid ${vars.color.border.subtle}`,
  transitionProperty: 'width, min-width',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: 'ease-in-out',
  selectors: {
    '&[data-side="right"]': {
      borderInlineEnd: 'none',
      borderInlineStart: `1px solid ${vars.color.border.subtle}`,
    },
    '&[data-collapsed="true"][data-collapsible="icon"]': {
      width: '3.25rem',
      minWidth: '3.25rem',
    },
    '&[data-collapsed="true"][data-collapsible="offcanvas"]': {
      width: 0,
      minWidth: 0,
      borderInlineEnd: 'none',
      overflow: 'hidden',
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const sidebarVariant = styleVariants({
  sidebar: {},
  floating: {
    margin: vars.space['2'],
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border.subtle}`,
    boxShadow: vars.shadow.sm,
    height: `calc(100% - ${vars.space['4']})`,
  },
  inset: {
    borderInlineEnd: 'none',
    background: vars.color.background.canvas,
  },
});

export const sidebarHeader = style({
  display: 'flex',
  alignItems: 'center',
  minHeight: '3rem',
  paddingInline: vars.space['3'],
  borderBlockEnd: `1px solid ${vars.color.border.subtle}`,
});

export const sidebarBody = style({
  flex: '1 1 auto',
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['4'],
  paddingInline: vars.space['2'],
  paddingBlock: vars.space['2'],
  scrollbarGutter: 'stable',
});

export const sidebarFooter = style({
  paddingInline: vars.space['2'],
  paddingBlock: vars.space['2'],
  borderBlockStart: `1px solid ${vars.color.border.subtle}`,
});

export const sidebarSeparator = style({
  height: '1px',
  background: vars.color.border.subtle,
  marginBlock: vars.space['2'],
  border: 'none',
});

export const sidebarTriggerButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.25rem',
  height: '2.25rem',
  padding: 0,
  background: 'transparent',
  border: '1px solid transparent',
  color: vars.color.foreground.default,
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  selectors: {
    '&:hover': { background: vars.color.accent.soft },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const sidebarNav = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
});

export const sidebarGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
});

export const sidebarGroupLabelRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['1'],
  paddingInline: vars.space['2'],
  paddingBlock: vars.space['1'],
  selectors: {
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: {
      display: 'none',
    },
  },
});

export const sidebarGroupLabel = style({
  flex: '1 1 auto',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: vars.color.foreground.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const sidebarGroupToggle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  padding: vars.space['0.5'],
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  borderRadius: vars.radius.xs,
  selectors: {
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const sidebarGroupCaret = style({
  transitionProperty: 'transform',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-open="true"]': { transform: 'rotate(90deg)' },
    '[data-cynosure-reduced-motion] &': { transitionDuration: '0s' },
  },
});

/** Collapsed-mode divider that replaces group labels on the icon rail. */
export const sidebarGroupCollapsedDivider = style({
  display: 'none',
  selectors: {
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: {
      display: 'block',
      height: '1px',
      background: vars.color.border.subtle,
      marginInline: vars.space['1'],
      marginBlock: vars.space['1'],
    },
  },
});

export const sidebarGroupBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
  selectors: {
    '&[data-open="false"]': { display: 'none' },
  },
});

export const sidebarItemRoot = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  height: '2.25rem',
  paddingInline: vars.space['2'],
  borderRadius: vars.radius.md,
  fontSize: '0.875rem',
  fontWeight: 500,
  color: vars.color.foreground.default,
  background: 'transparent',
  border: 'none',
  textDecoration: 'none',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'start',
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover:not([data-active="true"]):not([disabled])': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-active="true"]': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solid,
      fontWeight: 600,
    },
    '&[data-active="true"]::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: '0.125rem',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '3px',
      height: '1rem',
      borderRadius: vars.radius.full,
      background: vars.color.accent.solid,
    },
    '&[disabled]': { opacity: 0.5, cursor: 'not-allowed' },
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: {
      justifyContent: 'center',
      paddingInline: 0,
      width: '2.25rem',
      marginInline: 'auto',
    },
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &[data-active="true"]::before`]:
      {
        display: 'none',
      },
    '[data-cynosure-reduced-motion] &': { transitionDuration: '0s' },
  },
});

export const sidebarItemIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.125rem',
  height: '1.125rem',
  color: vars.color.foreground.muted,
  flexShrink: 0,
  position: 'relative',
  selectors: {
    [`${sidebarItemRoot}[data-active="true"] &`]: { color: vars.color.accent.solid },
  },
});

export const sidebarItemLabel = style({
  flex: '1 1 auto',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  selectors: {
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: {
      display: 'none',
    },
  },
});

export const sidebarItemBadge = style({
  selectors: {
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: {
      display: 'none',
    },
  },
});

/** Collapsed-mode dot that replaces the badge on the icon. */
export const sidebarItemBadgeDot = style({
  display: 'none',
  selectors: {
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: {
      display: 'block',
      position: 'absolute',
      top: 0,
      insetInlineEnd: 0,
      width: '6px',
      height: '6px',
      borderRadius: vars.radius.full,
      background: vars.color.accent.solid,
    },
  },
});

export const sidebarItemCaret = style({
  width: '14px',
  height: '14px',
  color: vars.color.foreground.muted,
  transitionProperty: 'transform',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-open="true"]': { transform: 'rotate(90deg)' },
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: { display: 'none' },
    '[data-cynosure-reduced-motion] &': { transitionDuration: '0s' },
  },
});

export const sidebarSubNavInline = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
  paddingInlineStart: vars.space['6'],
  position: 'relative',
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: vars.space['4'],
      top: 0,
      bottom: 0,
      width: '1px',
      background: vars.color.border.subtle,
    },
    '&[data-open="false"]': { display: 'none' },
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: { display: 'none' },
  },
});

export const sidebarSubItem = style({
  display: 'flex',
  alignItems: 'center',
  height: '2rem',
  paddingInline: vars.space['2'],
  borderRadius: vars.radius.sm,
  fontSize: '0.8125rem',
  color: vars.color.foreground.default,
  textDecoration: 'none',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'start',
  selectors: {
    '&:hover:not([data-active="true"]):not([disabled])': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-active="true"]': {
      color: vars.color.accent.solid,
      fontWeight: 600,
    },
    '&[disabled]': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const sidebarSubNavFlyout = style({
  minWidth: '12rem',
  background: vars.color.background.surface,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border.subtle}`,
  boxShadow: vars.shadow.md,
  paddingBlock: vars.space['2'],
  paddingInline: vars.space['1'],
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
});

export const sidebarSubNavFlyoutHeader = style({
  fontSize: '0.6875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: vars.color.foreground.muted,
  paddingInline: vars.space['2'],
  paddingBlock: vars.space['1'],
});
