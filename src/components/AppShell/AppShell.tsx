import {
  type CSSProperties,
  createContext,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { NavRailContext } from "../../foundations/nav-rail.js";
import { type PersistStorage, usePersistedState } from "../../foundations/persisted.js";
import { menu } from "../../icons/menu.js";
import { panelLeftClose } from "../../icons/panel-left-close.js";
import { panelLeftOpen } from "../../icons/panel-left-open.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Sheet } from "../Sheet/Sheet.js";
import { SkipLink } from "../SkipLink/SkipLink.js";

export interface AppShellTokens {
  /** Background of the navigation column. */
  navBackground: string;
  /** Background of the top bar. */
  headerBackground: string;
  /** Lines between the bar, the navigation and the content. */
  border: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    appShell: AppShellTokens;
  }
}

export interface AppShellLabels {
  /** The menu button that opens the navigation on narrow screens. Default: "Open navigation". */
  openNav: string;
  /** Title of the navigation drawer. Default: "Navigation". */
  nav: string;
  /** The skip link, shown on keyboard focus. Default: "Skip to content". */
  skip: string;
  /** The rail button (`navToggle`) while the navigation is full width. Default: "Collapse navigation". */
  collapseNav: string;
  /** The rail button while the navigation is a rail. Default: "Expand navigation". */
  expandNav: string;
}

export interface AppShellProps {
  /** Top bar content: brand, search, account. */
  header?: ReactNode;
  /** The navigation, usually a `SideNav`. Beside the content when wide; in a drawer when narrow. */
  nav?: ReactNode;
  /**
   * The product's mark, at the head of the navigation column beside the top bar (wide), or at the start of the top
   * bar after the menu button (narrow, or with no `nav`). It never widens the column: in the rail, show a compact mark
   * (`useAppShell().navCollapsed`).
   */
  brand?: ReactNode;
  /**
   * A button at the start of the top bar that collapses the navigation column to SideNav's icon rail and back (wide
   * only; narrow, the menu button opens the drawer instead). Its name comes from `labels.collapseNav` / `expandNav`.
   */
  navToggle?: boolean | undefined;
  /**
   * Whether the navigation column is collapsed to its rail (controlled). A SideNav in the column follows it unless
   * it is given `collapsed` itself; a group chosen in the rail expands it. In the drawer it is always full width.
   */
  navCollapsed?: boolean | undefined;
  /** Whether it starts collapsed, when uncontrolled. Default false. */
  defaultNavCollapsed?: boolean | undefined;
  /** Called with the new value when the rail button, or a group chosen in the rail, changes it. */
  onNavCollapsedChange?: ((collapsed: boolean) => void) | undefined;
  /** Remember the rail between visits under this storage key (opt-in; uncontrolled use). Read after mount. */
  navCollapsedKey?: string | undefined;
  /** Where `navCollapsedKey` keeps it: localStorage by default; any `{ get, set }`, sync or async. Never throws. */
  navCollapsedStorage?: PersistStorage | undefined;
  /**
   * A bottom tab bar on narrow screens, usually `<SideNav layout="bar">` with the app's three to five main sections.
   * Hidden when wide, where `nav` shows instead.
   */
  tabs?: ReactNode;
  /** The page content, rendered in `<main>`. */
  children?: ReactNode;
  /**
   * Width (of the shell itself, in px) below which the navigation moves into a drawer. Default: 768. It follows the
   * shell's width, not the window's, so it also works in side panels.
   */
  collapseBelow?: number;
  /**
   * Called with the new value each time the shell becomes narrow or wide again, for code outside the shell (inside
   * it, use `useAppShell()`). The shell starts wide, so the first call is `true`, before the first paint, when it
   * mounts narrow; a shell that mounts wide does not call it until it narrows.
   */
  onNarrowChange?: (narrow: boolean) => void;
  /** Replace the built-in English text: the menu button, the drawer title and the skip link. */
  labels?: Partial<AppShellLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-app-shell-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: AppShellLabels = {
  openNav: "Open navigation",
  nav: "Navigation",
  skip: "Skip to content",
  collapseNav: "Collapse navigation",
  expandNav: "Expand navigation",
};

const parseFlag = (raw: string) => (raw === "true" ? true : raw === "false" ? false : undefined);

/** What `useAppShell()` returns. */
export interface AppShellState {
  /**
   * Whether the shell is narrower than its `collapseBelow`: the navigation is in the drawer and `tabs` show. `false`
   * on the server, on the first client render (it is measured before the first paint) and outside an AppShell.
   */
  narrow: boolean;
  /** Whether the navigation column shows as a rail (never while `narrow`). `false` outside an AppShell. */
  navCollapsed: boolean;
}

const WIDE: AppShellState = { narrow: false, navCollapsed: false };
const Context = createContext<AppShellState>(WIDE);

/**
 * The state of the nearest AppShell, for anything rendered in its `header`, `nav`, `tabs` or content: `{ narrow }`.
 * Outside an AppShell it does not throw; it returns `{ narrow: false, navCollapsed: false }`.
 */
export function useAppShell(): AppShellState {
  return useContext(Context);
}

/**
 * The frame of an app: a top bar, the navigation beside the content, and `<main>`. On narrow screens the navigation
 * moves into a drawer opened from a menu button in the bar; choosing a link closes it. Includes a skip link.
 */
export function AppShell({
  header,
  nav,
  brand,
  navToggle = false,
  navCollapsed: navCollapsedProp,
  defaultNavCollapsed = false,
  onNavCollapsedChange,
  navCollapsedKey,
  navCollapsedStorage,
  tabs,
  children,
  collapseBelow = 768,
  onNarrowChange,
  labels,
  className,
  style,
}: AppShellProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = usePersistedState(
    navCollapsedProp,
    defaultNavCollapsed,
    onNavCollapsedChange,
    {
      key: navCollapsedKey,
      storage: navCollapsedStorage,
      parse: parseFlag,
      serialize: String,
    },
  );
  const rail = useMemo(() => ({ collapsed, setCollapsed }), [collapsed, setCollapsed]);

  useClientLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const now = el.getBoundingClientRect().width < collapseBelow;
      setNarrow(now);
      // Wide, the drawer is gone; it must not reopen by itself when the shell narrows again.
      if (!now) setDrawer(false);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapseBelow]);

  // Tell the outside once per change: never for the wide start, and not again when only the callback changes.
  const told = useRef(false);
  const notify = useRef(onNarrowChange);
  notify.current = onNarrowChange;
  useEffect(() => {
    if (told.current === narrow) return;
    told.current = narrow;
    notify.current?.(narrow);
  }, [narrow]);
  const state = useMemo(() => ({ narrow, navCollapsed: collapsed && !narrow }), [narrow, collapsed]);
  // The brand heads the navigation column when there is one beside the content; otherwise it starts the top bar.
  const brandInColumn = brand != null && !!nav && !narrow;
  const railButton = navToggle && !!nav && !narrow;

  // Choosing a destination in the drawer closes it; group toggles (aria-expanded) keep it open.
  const onDrawerClick = (event: MouseEvent<HTMLElement>) => {
    const target = (event.target as Element).closest("a[href], button");
    if (target && !target.hasAttribute("aria-expanded") && target.getAttribute("aria-disabled") !== "true")
      setDrawer(false);
  };

  return (
    <Context.Provider value={state}>
      <div
        ref={root}
        className={className ? `cy-app-shell ${className}` : "cy-app-shell"}
        data-narrow={narrow ? "" : undefined}
        data-nav={nav ? "" : undefined}
        data-tabs={tabs && narrow ? "" : undefined}
        data-brand={brandInColumn ? "" : undefined}
        style={style}
      >
        {/* Moves focus to main without touching the URL (the app's router owns it). */}
        <SkipLink href={`#${id}-main`} labels={{ skip: text.skip }} contained className="cy-app-shell-skip" />
        {brandInColumn && <div className="cy-app-shell-brand cy-reset">{brand}</div>}
        {(header || (nav && narrow) || railButton || (brand != null && !brandInColumn)) && (
          <header className="cy-app-shell-header cy-reset">
            {railButton && (
              <IconButton
                icon={collapsed ? panelLeftOpen : panelLeftClose}
                flipRtl
                label={collapsed ? text.expandNav : text.collapseNav}
                variant="ghost"
                tone="neutral"
                tooltipPlacement="end"
                aria-controls={`${id}-nav`}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
            {nav && narrow && (
              <IconButton
                icon={menu}
                label={text.openNav}
                variant="ghost"
                tone="neutral"
                tooltipPlacement="end"
                aria-expanded={drawer}
                onClick={() => setDrawer(true)}
              />
            )}
            {brand != null && !brandInColumn && <div className="cy-app-shell-mark cy-reset">{brand}</div>}
            <div className="cy-app-shell-bar cy-reset">{header}</div>
          </header>
        )}
        {nav && !narrow && (
          <div id={`${id}-nav`} className="cy-app-shell-nav cy-reset">
            <NavRailContext.Provider value={rail}>{nav}</NavRailContext.Provider>
          </div>
        )}
        <main id={`${id}-main`} tabIndex={-1} className="cy-app-shell-main cy-reset">
          {children}
        </main>
        {tabs && narrow && <div className="cy-app-shell-tabs cy-reset">{tabs}</div>}
        {nav && narrow && (
          // Kept mounted while closed, so the navigation keeps its open sections and scroll position.
          <Sheet open={drawer} onOpenChange={setDrawer} side="start" size="sm" title={text.nav} keepMounted>
            {/* biome-ignore lint/a11y/noStaticElementInteractions: delegated click from the links and buttons inside */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation of a link or button is a click too */}
            <div className="cy-app-shell-drawer cy-reset" onClick={onDrawerClick}>
              {nav}
            </div>
          </Sheet>
        )}
      </div>
    </Context.Provider>
  );
}
