import { HamburgerIcon, ListCollapseIcon } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '../../overlay/Drawer/Drawer.js';
import { cn } from '../../utils/cn.js';
import {
  sidebarBody,
  sidebarFooter,
  sidebarHeader,
  sidebarRoot,
  sidebarTriggerButton,
  sidebarVariant,
} from './Sidebar.css.js';
import { SidebarContext, type SidebarContextValue, useSidebar } from './context.js';

export interface SidebarProviderProps {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
  defaultMobileOpen?: boolean;
  mobileOpen?: boolean;
  onMobileOpenChange?: (value: boolean) => void;
  /** Media query that decides when to render as a `Drawer`. Default `(max-width: 47.99em)`. */
  mobileQuery?: string;
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'icon' | 'offcanvas' | 'none';
  children?: ReactNode;
}

/**
 * Provides the shared sidebar state (collapse, mobile drawer) and exposes
 * `useSidebar()`. Keep it high enough in the tree that both `<Sidebar>` and
 * `<SidebarTrigger>` sit underneath it.
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

  // `useBreakpoint` returns semantic breakpoint names; we only need the
  // boolean here. Match on the supplied query directly.
  const isMobile = useIsMobile(mobileQuery);

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
    ],
  );

  return <SidebarContext.Provider value={ctx}>{children}</SidebarContext.Provider>;
}

function useIsMobile(query: string): boolean {
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

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Override the `side` set on the provider (useful for asymmetric layouts). */
  side?: 'left' | 'right';
  /** Rendered inside the mobile Drawer as its accessible title. */
  mobileTitle?: ReactNode;
  mobileDescription?: ReactNode;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { className, children, side: sideProp, mobileTitle = 'Sidebar', mobileDescription, ...rest },
  ref,
) {
  const ctx = useSidebar();
  const side = sideProp ?? ctx.side;

  if (ctx.isMobile) {
    return (
      <Drawer open={ctx.mobileOpen} onOpenChange={ctx.setMobileOpen}>
        <DrawerContent side={side} showCloseButton>
          <DrawerTitle
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            }}
          >
            {mobileTitle}
          </DrawerTitle>
          {mobileDescription ? (
            <DrawerDescription
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
              }}
            >
              {mobileDescription}
            </DrawerDescription>
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

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(function SidebarHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(sidebarHeader, className)} {...rest} />;
});

export interface SidebarBodyProps extends HTMLAttributes<HTMLDivElement> {}
export const SidebarBody = forwardRef<HTMLDivElement, SidebarBodyProps>(function SidebarBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(sidebarBody, className)} {...rest} />;
});

export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}
export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(function SidebarFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(sidebarFooter, className)} {...rest} />;
});

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label for the trigger. Defaults switch on mobile vs. desktop. */
  label?: string;
  icon?: ReactNode;
}

/**
 * Context-aware trigger. On mobile, opens the Drawer; on desktop, toggles
 * the sidebar collapse state.
 */
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

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (ctx.isMobile) ctx.setMobileOpen(!ctx.mobileOpen);
      else ctx.toggleCollapsed();
    };

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
        {icon ?? (ctx.isMobile ? <HamburgerIcon /> : <ListCollapseIcon />)}
      </button>
    );
  },
);

export { useSidebar } from './context.js';
export type { SidebarContextValue } from './context.js';
