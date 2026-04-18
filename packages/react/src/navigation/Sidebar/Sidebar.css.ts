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
  selectors: {
    '&[data-side="right"]': {
      borderInlineEnd: 'none',
      borderInlineStart: `1px solid ${vars.color.border.subtle}`,
    },
    '&[data-collapsed="true"][data-collapsible="icon"]': {
      width: '4rem',
      minWidth: '4rem',
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
    borderRadius: vars.radius.md,
    borderInlineEnd: 'none',
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
  padding: vars.space['3'],
  minHeight: '3rem',
  borderBlockEnd: `1px solid ${vars.color.border.subtle}`,
});

export const sidebarBody = style({
  flex: '1 1 auto',
  overflow: 'auto',
  padding: vars.space['2'],
});

export const sidebarFooter = style({
  padding: vars.space['3'],
  borderBlockStart: `1px solid ${vars.color.border.subtle}`,
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
    '&:hover': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

/** Utility: hide label inside sidebar when collapsed to icon-rail. */
export const sidebarLabelCollapseHide = style({
  selectors: {
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: {
      display: 'none',
    },
  },
});
