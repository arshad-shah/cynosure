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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '../../overlay/Drawer/Drawer.js';
import { TooltipProvider } from '../../overlay/Tooltip/Tooltip.js';
import { cn } from '../../utils/cn.js';
import { sidebarRoot, sidebarVariant } from './Sidebar.css.js';
import { SidebarContext, type SidebarContextValue } from './context.js';
import { useIsMobile } from './useIsMobile.js';

/**
 * Props for the `SidebarProvider`. Hosts collapse / mobile-open state for
 * every `Sidebar`, `SidebarTrigger`, and `useSidebar()` consumer below it.
 */
export interface SidebarProviderProps {
  /**
   * Initial collapsed state in uncontrolled mode.
   * @default false
   */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state; pair with `onCollapsedChange`. */
  collapsed?: boolean;
  /** Change handler for the controlled collapsed state. */
  onCollapsedChange?: (value: boolean) => void;
  /**
   * Initial mobile open state in uncontrolled mode (i.e. when the
   * `mobileQuery` matches).
   * @default false
   */
  defaultMobileOpen?: boolean;
  /** Controlled mobile open state; pair with `onMobileOpenChange`. */
  mobileOpen?: boolean;
  /** Change handler for the controlled mobile open state. */
  onMobileOpenChange?: (value: boolean) => void;
  /**
   * Media query that flips the sidebar into mobile (Drawer) mode.
   * @default "(max-width: 47.99em)"
   */
  mobileQuery?: string;
  /**
   * Which edge the sidebar is anchored to.
   * @default "left"
   */
  side?: 'left' | 'right';
  /**
   * Visual variant. `sidebar` is the standard flush rail; `floating`
   * renders an inset elevated surface; `inset` reserves a gutter for the
   * main content area.
   * @default "sidebar"
   */
  variant?: 'sidebar' | 'floating' | 'inset';
  /**
   * Collapse behaviour. `icon` keeps a narrow icon-only rail; `offcanvas`
   * slides the sidebar off-screen; `none` disables collapse entirely.
   * @default "icon"
   */
  collapsible?: 'icon' | 'offcanvas' | 'none';
  children?: ReactNode;
}

/**
 * Context provider for the sidebar's collapse + mobile-open state. Place
 * once at the top of your app shell. Also mounts a `TooltipProvider` with
 * a short delay so collapsed icon-rail tooltips appear quickly.
 */
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
  const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);
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

/**
 * Props for the `Sidebar` element. Renders an `<aside>` on desktop and
 * automatically reflows into a `Drawer` when the provider's `mobileQuery`
 * matches.
 */
export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /**
   * Override the provider's `side`. Useful when a single layout has both a
   * left and a right sidebar.
   */
  side?: 'left' | 'right';
  /**
   * Visually-hidden title used as the mobile Drawer's accessible name.
   * @default "Sidebar"
   */
  mobileTitle?: ReactNode;
  /**
   * Visually-hidden description for the mobile Drawer (`aria-describedby`).
   */
  mobileDescription?: ReactNode;
}

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
} as const;

/**
 * Edge-anchored navigation panel. Renders an `<aside>` on desktop and an
 * accessible Drawer (focus-trapped, scroll-locked, dismissible by
 * `Escape` / outside click) on mobile. Reads collapse / mobile-open state
 * from `SidebarProvider`; pair with `SidebarTrigger` to expose a toggle.
 */
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
            // Inside the mobile Drawer the rail must fill the available width
            // rather than force its fixed desktop width (which the Drawer would
            // clip on narrow screens), so it honors the screen size.
            style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
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
