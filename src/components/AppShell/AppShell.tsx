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
import { menu } from "../../icons/menu.js";
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
}

export interface AppShellProps {
  /** Top bar content: brand, search, account. */
  header?: ReactNode;
  /** The navigation, usually a `SideNav`. Beside the content when wide; in a drawer when narrow. */
  nav?: ReactNode;
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
};

/** What `useAppShell()` returns. */
export interface AppShellState {
  /**
   * Whether the shell is narrower than its `collapseBelow`: the navigation is in the drawer and `tabs` show. `false`
   * on the server, on the first client render (it is measured before the first paint) and outside an AppShell.
   */
  narrow: boolean;
}

const WIDE: AppShellState = { narrow: false };
const Context = createContext<AppShellState>(WIDE);

/**
 * The state of the nearest AppShell, for anything rendered in its `header`, `nav`, `tabs` or content: `{ narrow }`.
 * Outside an AppShell it does not throw; it returns `{ narrow: false }`.
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

  useClientLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => setNarrow(el.getBoundingClientRect().width < collapseBelow);
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
  const state = useMemo(() => ({ narrow }), [narrow]);

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
        style={style}
      >
        {/* Moves focus to main without touching the URL (the app's router owns it). */}
        <SkipLink href={`#${id}-main`} labels={{ skip: text.skip }} className="cy-app-shell-skip" />
        {(header || (nav && narrow)) && (
          <header className="cy-app-shell-header cy-reset">
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
            <div className="cy-app-shell-bar cy-reset">{header}</div>
          </header>
        )}
        {nav && !narrow && <div className="cy-app-shell-nav cy-reset">{nav}</div>}
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
