# Sidebar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Sidebar shell with first-class navigation primitives (SidebarNav/Group/Item/SubNav/SubItem) that feature tooltip-on-collapse, nested flyouts, roving-focus keyboard navigation, and polished token-driven visuals.

**Architecture:** The single 279-line `Sidebar.tsx` is split into focused files. `SidebarProvider` mounts a shared `TooltipProvider`. Items are standalone primitives; when the rail is collapsed to icons, items auto-wrap in `Tooltip` and `SidebarSubNav` switches from inline disclosure to `Popover` flyout. Active state and routing remain consumer-controlled via `isActive` and `asChild` (Radix Slot via the local `primitives/Slot.js` wrapper).

**Tech Stack:** React 18, TypeScript, vanilla-extract (`*.css.ts`), `@radix-ui/react-slot` (already available as `primitives/Slot.js`), `@radix-ui/react-popover`, `@radix-ui/react-tooltip`, `lucide-react`, Vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-04-22-sidebar-redesign-design.md`

---

## Pre-flight

- Workdir: `packages/react/src/navigation/Sidebar/`.
- All file paths below are relative to the repo root `/Users/ShahA/Documents/practice/cynosure`.
- Run tests from repo root: `pnpm --filter @cynosure/react test -- <path>`.
- Biome runs on commit via lint-staged. Don't fight it.
- **Tokens:** every style value uses `vars.*` from `packages/react/src/styles/vars.css.ts`. Do not hardcode colors, spacing, radii, durations, or shadows.
- **Imports:** use `.js` extensions for intra-package imports (ESM convention the repo already follows).

---

## Task 1: Extract `useIsMobile` hook

**Files:**
- Create: `packages/react/src/navigation/Sidebar/useIsMobile.ts`

- [ ] **Step 1: Create the hook file**

```ts
// packages/react/src/navigation/Sidebar/useIsMobile.ts
import { useEffect, useState } from 'react';

/**
 * Tracks whether a media query matches. SSR-safe: returns `false` on the
 * server and during the first client render, then updates after mount.
 */
export function useIsMobile(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent | MediaQueryList) => setMatches(event.matches);
    handler(mql);
    mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
  }, [query]);
  return matches;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/navigation/Sidebar/useIsMobile.ts
git commit -m "refactor(sidebar): extract useIsMobile hook"
```

---

## Task 2: Extend context with `isCollapsedIconRail`

**Files:**
- Modify: `packages/react/src/navigation/Sidebar/context.ts`

- [ ] **Step 1: Replace the context file with extended contract**

```ts
// packages/react/src/navigation/Sidebar/context.ts
import { createContext, useContext } from 'react';

export interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  side: 'left' | 'right';
  variant: 'sidebar' | 'floating' | 'inset';
  collapsible: 'icon' | 'offcanvas' | 'none';
  /** True when the sidebar is visible, collapsed, and in icon-rail mode. */
  isCollapsedIconRail: boolean;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('Sidebar hooks must be used inside <SidebarProvider>');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/navigation/Sidebar/context.ts
git commit -m "refactor(sidebar): add isCollapsedIconRail to context"
```

---

## Task 3: Rewrite `Sidebar.css.ts` with new token-driven styles

**Files:**
- Modify: `packages/react/src/navigation/Sidebar/Sidebar.css.ts` (full rewrite)

- [ ] **Step 1: Replace the file**

```ts
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
  gap: vars.space['2.5'],
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
      color: vars.color.accent.strong,
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
      borderRadius: vars.radius.pill,
      background: vars.color.accent.solid,
    },
    '&[disabled]': { opacity: 0.5, cursor: 'not-allowed' },
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &`]: {
      justifyContent: 'center',
      paddingInline: 0,
      width: '2.25rem',
      marginInline: 'auto',
    },
    [`${sidebarRoot}[data-collapsed="true"][data-collapsible="icon"] &[data-active="true"]::before`]: {
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
    [`${sidebarItemRoot}[data-active="true"] &`]: { color: vars.color.accent.strong },
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
      borderRadius: vars.radius.pill,
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
      color: vars.color.accent.strong,
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @cynosure/react typecheck`
Expected: PASS. If a token path (e.g. `vars.color.accent.solid`) doesn't exist, open `packages/react/src/styles/vars.css.ts` and adjust to the closest existing token. Keep a note of substitutions.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/navigation/Sidebar/Sidebar.css.ts
git commit -m "style(sidebar): rewrite styles for new primitives and active treatment"
```

---

## Task 4: Write tests for `SidebarProvider` + `Sidebar` shell

**Files:**
- Create: `packages/react/src/navigation/__tests__/Sidebar.test.tsx` (replace existing)

- [ ] **Step 1: Replace the test file with shell tests only (more added later)**

```tsx
// packages/react/src/navigation/__tests__/Sidebar.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Sidebar,
  SidebarBody,
  SidebarProvider,
  SidebarTrigger,
} from '../Sidebar/index.js';

describe('Sidebar shell', () => {
  it('renders an aside with data attributes reflecting provider state', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="Primary">
          <SidebarBody>content</SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByRole('complementary', { name: 'Primary' });
    expect(aside).toHaveAttribute('data-collapsed', 'false');
    expect(aside).toHaveAttribute('data-side', 'left');
    expect(aside).toHaveAttribute('data-collapsible', 'icon');
  });

  it('uncontrolled SidebarTrigger toggles collapsed', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="Primary">
          <SidebarTrigger />
        </Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByRole('complementary', { name: 'Primary' });
    const button = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(aside).toHaveAttribute('data-collapsed', 'false');
    fireEvent.click(button);
    expect(aside).toHaveAttribute('data-collapsed', 'true');
  });

  it('controlled collapsed calls onCollapsedChange and does not update internally', () => {
    const onChange = vi.fn();
    render(
      <SidebarProvider collapsed={false} onCollapsedChange={onChange}>
        <Sidebar aria-label="Primary">
          <SidebarTrigger />
        </Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByRole('complementary', { name: 'Primary' });
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(aside).toHaveAttribute('data-collapsed', 'false');
  });
});
```

- [ ] **Step 2: Run — expect failures (shell primitives not yet implemented in new layout)**

Run: `pnpm --filter @cynosure/react test -- navigation/__tests__/Sidebar.test.tsx`
Expected: FAIL (either import errors if we've removed exports, or existing impl still passes — note results and proceed).

- [ ] **Step 3: Commit (tests only)**

```bash
git add packages/react/src/navigation/__tests__/Sidebar.test.tsx
git commit -m "test(sidebar): add shell tests for new layout"
```

---

## Task 5: Split `Sidebar.tsx` into shell-only; mount TooltipProvider

**Files:**
- Modify: `packages/react/src/navigation/Sidebar/Sidebar.tsx` (full rewrite — shell only)

- [ ] **Step 1: Replace the file**

```tsx
// packages/react/src/navigation/Sidebar/Sidebar.tsx
import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { TooltipProvider } from '../../overlay/Tooltip/Tooltip.js';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '../../overlay/Drawer/Drawer.js';
import { cn } from '../../utils/cn.js';
import { sidebarRoot, sidebarVariant } from './Sidebar.css.js';
import { SidebarContext, type SidebarContextValue } from './context.js';
import { useIsMobile } from './useIsMobile.js';

export interface SidebarProviderProps {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
  defaultMobileOpen?: boolean;
  mobileOpen?: boolean;
  onMobileOpenChange?: (value: boolean) => void;
  mobileQuery?: string;
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'icon' | 'offcanvas' | 'none';
  children?: ReactNode;
}

export function SidebarProvider({
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  defaultMobileOpen = false,
  mobileOpen: mobileOpenProp,
  onMobileOpenChange,
  mobileQuery = '(max-width: 47.99em)',
  side = 'left',
  variant = 'sidebar',
  collapsible = 'icon',
  children,
}: SidebarProviderProps): ReactElement {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [internalMobileOpen, setInternalMobileOpen] = useState(defaultMobileOpen);

  const collapsed = collapsedProp ?? internalCollapsed;
  const mobileOpen = mobileOpenProp ?? internalMobileOpen;

  const setCollapsed = useCallback(
    (value: boolean) => {
      if (collapsedProp === undefined) setInternalCollapsed(value);
      onCollapsedChange?.(value);
    },
    [collapsedProp, onCollapsedChange],
  );
  const toggleCollapsed = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed, setCollapsed],
  );
  const setMobileOpen = useCallback(
    (value: boolean) => {
      if (mobileOpenProp === undefined) setInternalMobileOpen(value);
      onMobileOpenChange?.(value);
    },
    [mobileOpenProp, onMobileOpenChange],
  );

  const isMobile = useIsMobile(mobileQuery);
  const isCollapsedIconRail = !isMobile && collapsed && collapsible === 'icon';

  const ctx = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
      isMobile,
      mobileOpen,
      setMobileOpen,
      side,
      variant,
      collapsible,
      isCollapsedIconRail,
    }),
    [
      collapsed,
      setCollapsed,
      toggleCollapsed,
      isMobile,
      mobileOpen,
      setMobileOpen,
      side,
      variant,
      collapsible,
      isCollapsedIconRail,
    ],
  );

  return (
    <SidebarContext.Provider value={ctx}>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  side?: 'left' | 'right';
  mobileTitle?: ReactNode;
  mobileDescription?: ReactNode;
}

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
} as const;

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { className, children, side: sideProp, mobileTitle = 'Sidebar', mobileDescription, ...rest },
  ref,
) {
  const ctx = useSidebarInternal();
  const side = sideProp ?? ctx.side;

  if (ctx.isMobile) {
    return (
      <Drawer open={ctx.mobileOpen} onOpenChange={ctx.setMobileOpen}>
        <DrawerContent side={side} showCloseButton>
          <DrawerTitle style={visuallyHidden}>{mobileTitle}</DrawerTitle>
          {mobileDescription ? (
            <DrawerDescription style={visuallyHidden}>{mobileDescription}</DrawerDescription>
          ) : null}
          <aside
            ref={ref}
            data-side={side}
            data-collapsible="none"
            data-collapsed="false"
            className={cn(sidebarRoot, sidebarVariant[ctx.variant], className)}
            {...rest}
          >
            {children}
          </aside>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <aside
      ref={ref}
      data-side={side}
      data-variant={ctx.variant}
      data-collapsed={ctx.collapsed ? 'true' : 'false'}
      data-collapsible={ctx.collapsible}
      className={cn(sidebarRoot, sidebarVariant[ctx.variant], className)}
      {...rest}
    >
      {children}
    </aside>
  );
});

// Re-export for consumers
export { useSidebar } from './context.js';
export type { SidebarContextValue } from './context.js';

// Internal wrapper so the Sidebar component uses the same hook
import { useSidebar as useSidebarInternal } from './context.js';
```

- [ ] **Step 2: Run shell tests**

Run: `pnpm --filter @cynosure/react test -- navigation/__tests__/Sidebar.test.tsx`
Expected: Shell tests PASS. (Other primitives like `SidebarHeader`, `SidebarFooter`, `SidebarTrigger` are still imported elsewhere — they'll fail once removed; we restore them in Task 6.)

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/navigation/Sidebar/Sidebar.tsx
git commit -m "refactor(sidebar): reduce Sidebar.tsx to shell + TooltipProvider"
```

---

## Task 6: Create `SidebarHeader.tsx` (Header, Body, Footer, Separator)

**Files:**
- Create: `packages/react/src/navigation/Sidebar/SidebarHeader.tsx`

- [ ] **Step 1: Create the file**

```tsx
// packages/react/src/navigation/Sidebar/SidebarHeader.tsx
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import {
  sidebarBody,
  sidebarFooter,
  sidebarHeader,
  sidebarSeparator,
} from './Sidebar.css.js';

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(sidebarHeader, className)} {...rest} />;
  },
);

export interface SidebarBodyProps extends HTMLAttributes<HTMLDivElement> {}
export const SidebarBody = forwardRef<HTMLDivElement, SidebarBodyProps>(
  function SidebarBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(sidebarBody, className)} {...rest} />;
  },
);

export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}
export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(sidebarFooter, className)} {...rest} />;
  },
);

export interface SidebarSeparatorProps extends HTMLAttributes<HTMLHRElement> {}
export const SidebarSeparator = forwardRef<HTMLHRElement, SidebarSeparatorProps>(
  function SidebarSeparator({ className, ...rest }, ref) {
    return <hr ref={ref} className={cn(sidebarSeparator, className)} {...rest} />;
  },
);
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/navigation/Sidebar/SidebarHeader.tsx
git commit -m "feat(sidebar): add SidebarHeader/Body/Footer/Separator primitives"
```

---

## Task 7: Create `SidebarTrigger.tsx`

**Files:**
- Create: `packages/react/src/navigation/Sidebar/SidebarTrigger.tsx`

- [ ] **Step 1: Create the file**

```tsx
// packages/react/src/navigation/Sidebar/SidebarTrigger.tsx
import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn.js';
import { sidebarTriggerButton } from './Sidebar.css.js';
import { useSidebar } from './context.js';

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: ReactNode;
}

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ className, label, icon, onClick, type, ...rest }, ref) {
    const ctx = useSidebar();
    const defaultLabel = ctx.isMobile
      ? ctx.mobileOpen
        ? 'Close sidebar'
        : 'Open sidebar'
      : ctx.collapsed
        ? 'Expand sidebar'
        : 'Collapse sidebar';

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (ctx.isMobile) ctx.setMobileOpen(!ctx.mobileOpen);
      else ctx.toggleCollapsed();
    };

    const defaultIcon = ctx.isMobile
      ? ctx.mobileOpen
        ? <XIcon size={18} />
        : <MenuIcon size={18} />
      : ctx.collapsed
        ? <PanelLeftOpenIcon size={18} />
        : <PanelLeftCloseIcon size={18} />;

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        aria-label={label ?? defaultLabel}
        aria-pressed={ctx.isMobile ? ctx.mobileOpen : !ctx.collapsed}
        aria-expanded={ctx.isMobile ? ctx.mobileOpen : !ctx.collapsed}
        className={cn(sidebarTriggerButton, className)}
        onClick={handleClick}
        {...rest}
      >
        {icon ?? defaultIcon}
      </button>
    );
  },
);
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/navigation/Sidebar/SidebarTrigger.tsx
git commit -m "feat(sidebar): add SidebarTrigger with PanelLeft icons"
```

---

## Task 8: Create `useRovingFocus.ts` hook with tests

**Files:**
- Create: `packages/react/src/navigation/Sidebar/useRovingFocus.ts`
- Create: `packages/react/src/navigation/__tests__/useRovingFocus.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// packages/react/src/navigation/__tests__/useRovingFocus.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRovingFocus } from '../Sidebar/useRovingFocus.js';

function Harness() {
  const { containerRef } = useRovingFocus<HTMLDivElement>();
  return (
    <div ref={containerRef} data-testid="nav">
      <button data-roving-focus-item="">One</button>
      <button data-roving-focus-item="">Two</button>
      <button data-roving-focus-item="" disabled>Three</button>
      <button data-roving-focus-item="">Four</button>
    </div>
  );
}

describe('useRovingFocus', () => {
  it('ArrowDown moves focus to next enabled item and wraps', () => {
    render(<Harness />);
    const [one, two, , four] = screen.getAllByRole('button') as HTMLButtonElement[];
    one.focus();
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(two);
    // skip disabled Three, go to Four
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(four);
    // wrap to One
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(one);
  });

  it('ArrowUp wraps backwards and Home/End jump', () => {
    render(<Harness />);
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
    buttons[1].focus();
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'End' });
    expect(document.activeElement).toBe(buttons[3]);
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'Home' });
    expect(document.activeElement).toBe(buttons[0]);
  });
});
```

- [ ] **Step 2: Run — expect fail**

Run: `pnpm --filter @cynosure/react test -- navigation/__tests__/useRovingFocus.test.tsx`
Expected: FAIL with "Cannot find module `useRovingFocus`".

- [ ] **Step 3: Implement the hook**

```ts
// packages/react/src/navigation/Sidebar/useRovingFocus.ts
import { type KeyboardEvent, type RefObject, useCallback, useEffect, useRef } from 'react';

/**
 * Roving-focus pattern for a container of `[data-roving-focus-item]` elements.
 * ArrowUp/Down cycle, Home/End jump, disabled items are skipped. Consumers
 * render items; they don't need to manage focus themselves.
 */
export function useRovingFocus<T extends HTMLElement>(): {
  containerRef: RefObject<T>;
} {
  const containerRef = useRef<T>(null);

  const getItems = useCallback((): HTMLElement[] => {
    const root = containerRef.current;
    if (!root) return [];
    return Array.from(
      root.querySelectorAll<HTMLElement>('[data-roving-focus-item]'),
    ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true');
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const onKeyDown = (e: Event) => {
      const ev = e as unknown as KeyboardEvent<HTMLElement>;
      const items = getItems();
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? items.indexOf(active) : -1;
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        const next = idx < 0 ? 0 : (idx + 1) % items.length;
        items[next]?.focus();
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        const next = idx < 0 ? items.length - 1 : (idx - 1 + items.length) % items.length;
        items[next]?.focus();
      } else if (ev.key === 'Home') {
        ev.preventDefault();
        items[0]?.focus();
      } else if (ev.key === 'End') {
        ev.preventDefault();
        items[items.length - 1]?.focus();
      }
    };
    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [getItems]);

  return { containerRef };
}
```

- [ ] **Step 4: Run tests — expect pass**

Run: `pnpm --filter @cynosure/react test -- navigation/__tests__/useRovingFocus.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/navigation/Sidebar/useRovingFocus.ts \
        packages/react/src/navigation/__tests__/useRovingFocus.test.tsx
git commit -m "feat(sidebar): add useRovingFocus hook"
```

---

## Task 9: Create `SidebarNav.tsx` (Nav + Group)

**Files:**
- Create: `packages/react/src/navigation/Sidebar/SidebarNav.tsx`

- [ ] **Step 1: Create the file**

```tsx
// packages/react/src/navigation/Sidebar/SidebarNav.tsx
import { ChevronRight } from 'lucide-react';
import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useId,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import {
  sidebarGroup,
  sidebarGroupBody,
  sidebarGroupCaret,
  sidebarGroupCollapsedDivider,
  sidebarGroupLabel,
  sidebarGroupLabelRow,
  sidebarGroupToggle,
  sidebarNav,
} from './Sidebar.css.js';
import { useRovingFocus } from './useRovingFocus.js';

export interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  'aria-label'?: string;
}

export const SidebarNav = forwardRef<HTMLElement, SidebarNavProps>(function SidebarNav(
  { className, 'aria-label': ariaLabel, children, ...rest },
  ref,
) {
  const { containerRef } = useRovingFocus<HTMLElement>();
  return (
    <nav
      ref={(node) => {
        (containerRef as { current: HTMLElement | null }).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as { current: HTMLElement | null }).current = node;
      }}
      aria-label={ariaLabel}
      className={cn(sidebarNav, className)}
      {...rest}
    >
      {children}
    </nav>
  );
});

export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Trailing slot beside the group label (e.g. a "+" button). */
  action?: ReactNode;
}

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup(
  {
    label,
    collapsible = false,
    defaultOpen = true,
    open: openProp,
    onOpenChange,
    action,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : internalOpen;
  const bodyId = useId();

  const toggle = () => {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div ref={ref} className={cn(sidebarGroup, className)} {...rest}>
      {label !== undefined ? (
        <div className={sidebarGroupLabelRow}>
          <span className={sidebarGroupLabel}>{label}</span>
          {action}
          {collapsible ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={toggle}
              className={sidebarGroupToggle}
            >
              <ChevronRight
                size={14}
                data-open={open ? 'true' : 'false'}
                className={sidebarGroupCaret}
              />
            </button>
          ) : null}
        </div>
      ) : null}
      <div aria-hidden="true" className={sidebarGroupCollapsedDivider} />
      <div id={bodyId} data-open={open ? 'true' : 'false'} className={sidebarGroupBody}>
        {children}
      </div>
    </div>
  );
});
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/navigation/Sidebar/SidebarNav.tsx
git commit -m "feat(sidebar): add SidebarNav and SidebarGroup primitives"
```

---

## Task 10: Create `SidebarItem.tsx` with tooltip wrapping

**Files:**
- Create: `packages/react/src/navigation/Sidebar/SidebarItem.tsx`

- [ ] **Step 1: Create the file**

```tsx
// packages/react/src/navigation/Sidebar/SidebarItem.tsx
import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react';
import { Slot } from '../../primitives/Slot.js';
import { Tooltip } from '../../overlay/Tooltip/Tooltip.js';
import { cn } from '../../utils/cn.js';
import {
  sidebarItemBadge,
  sidebarItemBadgeDot,
  sidebarItemIcon,
  sidebarItemLabel,
  sidebarItemRoot,
} from './Sidebar.css.js';
import { useSidebar } from './context.js';

export interface SidebarItemProps extends HTMLAttributes<HTMLElement> {
  icon?: ReactNode;
  label?: ReactNode;
  badge?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  /** Override or disable the auto-tooltip shown when the rail is collapsed. */
  tooltip?: ReactNode | false;
}

export const SidebarItem = forwardRef<HTMLElement, SidebarItemProps>(function SidebarItem(
  {
    icon,
    label,
    badge,
    isActive,
    disabled,
    asChild,
    tooltip,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const ctx = useSidebar();
  const Comp: typeof Slot | 'button' = asChild ? Slot : 'button';

  const content = (
    <>
      {icon ? (
        <span className={sidebarItemIcon} aria-hidden="true">
          {icon}
          {badge !== undefined && badge !== null ? (
            <span className={sidebarItemBadgeDot} aria-hidden="true" />
          ) : null}
        </span>
      ) : null}
      <span className={sidebarItemLabel}>{label ?? children}</span>
      {badge !== undefined && badge !== null ? (
        <span className={sidebarItemBadge}>{badge}</span>
      ) : null}
    </>
  );

  const commonProps = {
    ref: ref as never,
    'data-roving-focus-item': '',
    'data-active': isActive ? 'true' : undefined,
    'aria-current': isActive ? ('page' as const) : undefined,
    className: cn(sidebarItemRoot, className),
    onClick: disabled ? undefined : onClick,
    ...(Comp === 'button' ? { type: 'button' as const, disabled } : { 'aria-disabled': disabled }),
    ...rest,
  };

  let node: ReactElement;
  if (asChild && isValidElement(children)) {
    node = (
      <Comp {...commonProps}>{cloneElement(children, {}, content)}</Comp>
    );
  } else {
    node = <Comp {...commonProps}>{content}</Comp>;
  }

  const shouldTooltip =
    ctx.isCollapsedIconRail && tooltip !== false && (tooltip || label);
  if (!shouldTooltip) return node;

  return (
    <Tooltip
      content={tooltip ?? label}
      side={ctx.side === 'right' ? 'left' : 'right'}
      delayMs={200}
    >
      {node}
    </Tooltip>
  );
});
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/navigation/Sidebar/SidebarItem.tsx
git commit -m "feat(sidebar): add SidebarItem with auto-tooltip on collapse"
```

---

## Task 11: Create `SidebarSubNav.tsx` (disclosure ↔ flyout)

**Files:**
- Create: `packages/react/src/navigation/Sidebar/SidebarSubNav.tsx`

- [ ] **Step 1: Create the file**

```tsx
// packages/react/src/navigation/Sidebar/SidebarSubNav.tsx
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  forwardRef,
  useState,
} from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../overlay/Popover/Popover.js';
import { Slot } from '../../primitives/Slot.js';
import { cn } from '../../utils/cn.js';
import {
  sidebarSubItem,
  sidebarSubNavFlyout,
  sidebarSubNavFlyoutHeader,
  sidebarSubNavInline,
} from './Sidebar.css.js';
import { useSidebar } from './context.js';

export interface SidebarSubNavProps {
  /** Parent label shown as the flyout header when collapsed. */
  parentLabel?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  /** Trigger element (usually the parent `SidebarItem`). Required for flyout mode. */
  trigger?: ReactNode;
  className?: string;
}

export const SidebarSubNav = forwardRef<HTMLDivElement, SidebarSubNavProps>(
  function SidebarSubNav(
    { parentLabel, defaultOpen = false, open: openProp, onOpenChange, children, trigger, className },
    ref,
  ) {
    const ctx = useSidebar();
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const open = isControlled ? Boolean(openProp) : internalOpen;

    const setOpen = (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    if (ctx.isCollapsedIconRail && trigger) {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            side={ctx.side === 'right' ? 'left' : 'right'}
            align="start"
            sideOffset={4}
            className={cn(sidebarSubNavFlyout, className)}
          >
            {parentLabel ? (
              <div className={sidebarSubNavFlyoutHeader}>{parentLabel}</div>
            ) : null}
            {children}
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <>
        {trigger}
        <div
          ref={ref}
          data-open={open ? 'true' : 'false'}
          className={cn(sidebarSubNavInline, className)}
        >
          {children}
        </div>
      </>
    );
  },
);

type SubItemProps = {
  isActive?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>;

export const SidebarSubItem = forwardRef<HTMLElement, SubItemProps>(function SidebarSubItem(
  { isActive, disabled, asChild, className, children, ...rest },
  ref,
) {
  const Comp: typeof Slot | 'button' = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref as never}
      data-roving-focus-item=""
      data-active={isActive ? 'true' : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(sidebarSubItem, className)}
      {...(Comp === 'button' ? { type: 'button' as const, disabled } : { 'aria-disabled': disabled })}
      {...rest}
    >
      {children}
    </Comp>
  );
});
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/navigation/Sidebar/SidebarSubNav.tsx
git commit -m "feat(sidebar): add SidebarSubNav with inline/flyout switch"
```

---

## Task 12: Update barrel `index.ts`

**Files:**
- Modify: `packages/react/src/navigation/Sidebar/index.ts`

- [ ] **Step 1: Replace**

```ts
// packages/react/src/navigation/Sidebar/index.ts
export { Sidebar, SidebarProvider, useSidebar } from './Sidebar.js';
export type {
  SidebarContextValue,
  SidebarProps,
  SidebarProviderProps,
} from './Sidebar.js';
export {
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from './SidebarHeader.js';
export type {
  SidebarBodyProps,
  SidebarFooterProps,
  SidebarHeaderProps,
  SidebarSeparatorProps,
} from './SidebarHeader.js';
export { SidebarTrigger } from './SidebarTrigger.js';
export type { SidebarTriggerProps } from './SidebarTrigger.js';
export { SidebarGroup, SidebarNav } from './SidebarNav.js';
export type { SidebarGroupProps, SidebarNavProps } from './SidebarNav.js';
export { SidebarItem } from './SidebarItem.js';
export type { SidebarItemProps } from './SidebarItem.js';
export { SidebarSubItem, SidebarSubNav } from './SidebarSubNav.js';
export type { SidebarSubNavProps } from './SidebarSubNav.js';
```

- [ ] **Step 2: Typecheck + run all sidebar tests**

Run: `pnpm --filter @cynosure/react typecheck && pnpm --filter @cynosure/react test -- navigation/__tests__/Sidebar.test.tsx navigation/__tests__/useRovingFocus.test.tsx`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/navigation/Sidebar/index.ts
git commit -m "feat(sidebar): export new navigation primitives"
```

---

## Task 13: Extend `Sidebar.test.tsx` — items, tooltip, group, subnav

**Files:**
- Modify: `packages/react/src/navigation/__tests__/Sidebar.test.tsx`

- [ ] **Step 1: Append tests**

Append these `describe` blocks to the existing file:

```tsx
import {
  Sidebar,
  SidebarBody,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
  SidebarSubItem,
  SidebarSubNav,
  SidebarTrigger,
} from '../Sidebar/index.js';

describe('SidebarItem', () => {
  it('renders icon, label, badge, and aria-current when active', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<svg data-testid="ic" />} label="Inbox" badge="3" isActive />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button', { name: /inbox/i });
    expect(btn).toHaveAttribute('aria-current', 'page');
    expect(btn).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('ic')).toBeInTheDocument();
    expect(btn).toHaveTextContent('3');
  });

  it('asChild forwards onto an anchor', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem asChild label="Home">
                <a href="/home">Home</a>
              </SidebarItem>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const link = screen.getByRole('link', { name: /home/i });
    expect(link).toHaveAttribute('href', '/home');
  });

  it('does not wrap in tooltip when expanded', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    // Tooltip content is rendered in a portal only on open; we assert the
    // trigger is not a Radix tooltip trigger by checking for data attribute.
    const btn = screen.getByRole('button', { name: /inbox/i });
    expect(btn).not.toHaveAttribute('data-state');
  });

  it('wraps in tooltip when collapsed to icon rail', async () => {
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const btn = screen.getByRole('button', { name: /inbox/i });
    // Radix tooltip adds data-state to the trigger once it mounts.
    expect(btn).toHaveAttribute('data-state');
  });
});

describe('SidebarGroup', () => {
  it('collapsible group toggles aria-expanded', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarGroup label="Admin" collapsible defaultOpen>
                <SidebarItem label="Members" />
              </SidebarGroup>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    const toggle = screen.getByRole('button', { expanded: true });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('SidebarSubNav', () => {
  it('renders inline when expanded', () => {
    render(
      <SidebarProvider>
        <Sidebar aria-label="S">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarSubNav
                parentLabel="Settings"
                defaultOpen
                trigger={<SidebarItem label="Settings" />}
              >
                <SidebarSubItem>Billing</SidebarSubItem>
                <SidebarSubItem isActive>Team</SidebarSubItem>
              </SidebarSubNav>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByRole('button', { name: 'Billing' })).toBeInTheDocument();
    const team = screen.getByRole('button', { name: 'Team' });
    expect(team).toHaveAttribute('aria-current', 'page');
  });
});
```

- [ ] **Step 2: Run — expect pass**

Run: `pnpm --filter @cynosure/react test -- navigation/__tests__/Sidebar.test.tsx`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/navigation/__tests__/Sidebar.test.tsx
git commit -m "test(sidebar): cover items, tooltips, groups, and sub-nav"
```

---

## Task 14: Rewrite Storybook stories

**Files:**
- Modify: `packages/react/src/navigation/Sidebar/Sidebar.stories.tsx` (full rewrite)

- [ ] **Step 1: Replace with stories using `lucide-react` icons + new primitives**

```tsx
// packages/react/src/navigation/Sidebar/Sidebar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import {
  CogIcon,
  InboxIcon,
  LayoutDashboardIcon,
  PlusIcon,
  UsersIcon,
} from 'lucide-react';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
  SidebarSeparator,
  SidebarSubItem,
  SidebarSubNav,
  SidebarTrigger,
} from './index.js';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

const ShellLayout = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    style={{
      display: 'flex',
      minHeight: 420,
      border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
      borderRadius: 12,
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

const DemoMain = ({ children }: { children?: ReactNode }): ReactElement => (
  <main style={{ flex: 1, padding: 24 }}>
    {children ?? (
      <Stack gap="3">
        <Heading level={3}>Main content</Heading>
        <Text color="fg.muted">Toggle the sidebar with the trigger.</Text>
      </Stack>
    )}
  </main>
);

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarHeader>
            <Inline gap="2" align="center" justify="between">
              <Text weight="semibold">Acme</Text>
              <SidebarTrigger />
            </Inline>
          </SidebarHeader>
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" isActive />
              <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" badge="3" />
              <SidebarItem icon={<UsersIcon size={18} />} label="Team" />
              <SidebarItem icon={<CogIcon size={18} />} label="Settings" />
            </SidebarNav>
          </SidebarBody>
          <SidebarFooter>
            <Text size="xs" color="fg.muted">v1.0</Text>
          </SidebarFooter>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const CollapsibleRail: Story = {
  render: () => {
    function Demo(): ReactElement {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
          <ShellLayout>
            <Sidebar aria-label="Primary">
              <SidebarHeader>
                <Inline gap="2" align="center" justify="between">
                  <Text weight="semibold">Acme</Text>
                  <SidebarTrigger />
                </Inline>
              </SidebarHeader>
              <SidebarBody>
                <SidebarNav aria-label="Primary">
                  <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" isActive />
                  <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" badge="3" />
                  <SidebarItem icon={<UsersIcon size={18} />} label="Team" />
                </SidebarNav>
              </SidebarBody>
            </Sidebar>
            <DemoMain>
              <Text>Collapsed: {collapsed ? 'yes' : 'no'}</Text>
            </DemoMain>
          </ShellLayout>
        </SidebarProvider>
      );
    }
    return <Demo />;
  },
};

export const NestedNav: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" />
              <SidebarSubNav
                parentLabel="Settings"
                defaultOpen
                trigger={<SidebarItem icon={<CogIcon size={18} />} label="Settings" />}
              >
                <SidebarSubItem isActive>Billing</SidebarSubItem>
                <SidebarSubItem>Team</SidebarSubItem>
                <SidebarSubItem>API</SidebarSubItem>
              </SidebarSubNav>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarGroup label="Workspace">
                <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" isActive />
                <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" badge="12" />
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup
                label="Projects"
                action={
                  <button
                    type="button"
                    aria-label="New project"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <PlusIcon size={14} />
                  </button>
                }
              >
                <SidebarItem label="Website" />
                <SidebarItem label="Mobile app" />
              </SidebarGroup>
              <SidebarGroup label="Admin" collapsible>
                <SidebarItem icon={<UsersIcon size={18} />} label="Members" />
                <SidebarItem icon={<CogIcon size={18} />} label="Settings" />
              </SidebarGroup>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const AsChildLinks: Story = {
  render: () => (
    <SidebarProvider>
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem asChild icon={<LayoutDashboardIcon size={18} />} label="Dashboard">
                <a href="/dashboard">Dashboard</a>
              </SidebarItem>
              <SidebarItem asChild icon={<InboxIcon size={18} />} label="Inbox">
                <a href="/inbox">Inbox</a>
              </SidebarItem>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const MobileDrawer: Story = {
  render: () => (
    <SidebarProvider mobileQuery="(min-width: 0px)">
      <div
        style={{
          minHeight: 360,
          padding: 24,
          border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
          borderRadius: 12,
        }}
      >
        <Inline align="center" justify="between" gap="3">
          <SidebarTrigger />
          <Text weight="semibold">Acme — Mobile</Text>
          <span />
        </Inline>
        <Sidebar aria-label="Primary" mobileTitle="Main menu">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" />
              <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </div>
    </SidebarProvider>
  ),
};

export const RightSide: Story = {
  render: () => (
    <SidebarProvider side="right">
      <ShellLayout>
        <DemoMain />
        <Sidebar aria-label="Inspector">
          <SidebarHeader>
            <Inline gap="2" align="center" justify="between">
              <Text weight="semibold">Inspector</Text>
              <SidebarTrigger />
            </Inline>
          </SidebarHeader>
          <SidebarBody>
            <Text size="sm" color="fg.muted">Metadata, tags, linked items.</Text>
          </SidebarBody>
        </Sidebar>
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const FloatingVariant: Story = {
  render: () => (
    <SidebarProvider variant="floating">
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" isActive />
              <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const InsetVariant: Story = {
  render: () => (
    <SidebarProvider variant="inset">
      <ShellLayout>
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <SidebarItem icon={<LayoutDashboardIcon size={18} />} label="Dashboard" isActive />
              <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" />
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
        <DemoMain />
      </ShellLayout>
    </SidebarProvider>
  ),
};

export const DocsShell: Story = {
  render: () => {
    function Demo(): ReactElement {
      const [active, setActive] = useState('theming');
      return (
        <SidebarProvider>
          <ShellLayout>
            <Sidebar aria-label="Docs">
              <SidebarHeader>
                <Text weight="semibold">Cynosure docs</Text>
              </SidebarHeader>
              <SidebarBody>
                <SidebarNav aria-label="Docs">
                  <SidebarGroup label="Getting started">
                    <SidebarItem
                      label="Installation"
                      isActive={active === 'install'}
                      onClick={() => setActive('install')}
                    />
                    <SidebarItem
                      label="Theming"
                      isActive={active === 'theming'}
                      onClick={() => setActive('theming')}
                    />
                  </SidebarGroup>
                  <SidebarGroup label="Components" collapsible defaultOpen>
                    <SidebarItem
                      label="Button"
                      isActive={active === 'button'}
                      onClick={() => setActive('button')}
                    />
                    <SidebarItem
                      label="Input"
                      isActive={active === 'input'}
                      onClick={() => setActive('input')}
                    />
                  </SidebarGroup>
                </SidebarNav>
              </SidebarBody>
            </Sidebar>
            <DemoMain>
              <Heading level={3}>{active}</Heading>
            </DemoMain>
          </ShellLayout>
        </SidebarProvider>
      );
    }
    return <Demo />;
  },
};
```

- [ ] **Step 2: Verify stories build**

Run: `pnpm --filter @cynosure/react build-storybook --quiet` (if that script is absent, run `pnpm --filter @cynosure/react typecheck` instead).
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/navigation/Sidebar/Sidebar.stories.tsx
git commit -m "docs(sidebar): rewrite stories around new primitives"
```

---

## Task 15: Full sweep — tests, typecheck, lint

**Files:** none (verification).

- [ ] **Step 1: Run full test suite**

Run: `pnpm --filter @cynosure/react test`
Expected: all PASS.

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @cynosure/react typecheck`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `pnpm --filter @cynosure/react lint` (or the repo's biome command if different)
Expected: PASS.

- [ ] **Step 4: Visual smoke**

Run: `pnpm --filter @cynosure/react storybook` locally; open `Navigation/Sidebar` stories. Verify:
- Default renders with active pill + leading accent bar.
- CollapsibleRail animates to ~3.25rem; hovering items shows tooltips with labels.
- NestedNav flyout opens when collapsed.
- MobileDrawer opens the drawer and shows full-width content.

- [ ] **Step 5: Final commit if any fix-ups were needed**

```bash
git status
# if clean, no commit. Otherwise:
git add -A
git commit -m "chore(sidebar): final fix-ups from full sweep"
```

---

## Self-Review (done during planning, left here for reference)

- **Spec coverage:** Provider+context ✓ (T2,T5). Shell/Drawer ✓ (T5). Header/Body/Footer/Separator ✓ (T6). Trigger+icons ✓ (T7). Roving focus ✓ (T8). Nav/Group + action slot + collapsible ✓ (T9). Item + tooltip + asChild + badge + active ✓ (T10). SubNav inline↔flyout ✓ (T11). Stories covering every variant ✓ (T14). Tests covering shell, item, tooltip, group, subnav, roving ✓ (T4,T8,T13).
- **Placeholder scan:** no TBDs; all code blocks complete.
- **Type consistency:** `isCollapsedIconRail` added to context in T2 and consumed in T5 (provider), T10 (item), T11 (subnav). `primitives/Slot.js` used consistently in T10 and T11. `data-roving-focus-item` attribute identical across T8 reader and T10/T11 writers.
- **Known risk:** Token paths (`vars.color.accent.strong`, `vars.color.accent.solid`, `vars.color.background.surface.hover`) may not all exist. T3 Step 2 instructs the implementer to substitute with closest existing tokens and note subs. This is a concrete recovery, not a TBD.
