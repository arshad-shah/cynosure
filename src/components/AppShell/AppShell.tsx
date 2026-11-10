import { type CSSProperties, type MouseEvent, type ReactNode, useId, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { LinkBase } from "../../foundations/LinkBase/LinkBase.js";
import { menu } from "../../icons/menu.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Sheet } from "../Sheet/Sheet.js";

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
  /** The page content, rendered in `<main>`. */
  children?: ReactNode;
  /**
   * Width (of the shell itself, in px) below which the navigation moves into a drawer. Default: 768. It follows the
   * shell's width, not the window's, so it also works in side panels.
   */
  collapseBelow?: number;
  labels?: Partial<AppShellLabels>;
  className?: string;
  /** Layout only. Restyle through --cy-app-shell-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: AppShellLabels = {
  openNav: "Open navigation",
  nav: "Navigation",
  skip: "Skip to content",
};

/**
 * The frame of an app: a top bar, the navigation beside the content, and `<main>`. On narrow screens the navigation
 * moves into a drawer opened from a menu button in the bar; choosing a link closes it. Includes a skip link.
 */
export function AppShell({
  header,
  nav,
  children,
  collapseBelow = 768,
  labels,
  className,
  style,
}: AppShellProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLElement>(null);
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

  // Choosing a destination in the drawer closes it; group toggles (aria-expanded) keep it open.
  const onDrawerClick = (event: MouseEvent<HTMLElement>) => {
    const target = (event.target as Element).closest("a[href], button");
    if (target && !target.hasAttribute("aria-expanded") && target.getAttribute("aria-disabled") !== "true")
      setDrawer(false);
  };

  return (
    <div
      ref={root}
      className={className ? `cy-app-shell ${className}` : "cy-app-shell"}
      data-narrow={narrow ? "" : undefined}
      data-nav={nav ? "" : undefined}
      style={style}
    >
      <LinkBase
        className="cy-app-shell-skip cy-reset"
        href={`#${id}-main`}
        onClick={(event) => {
          // Move focus without touching the URL (the app's router owns it).
          event.preventDefault();
          main.current?.focus();
        }}
      >
        {text.skip}
      </LinkBase>
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
      <main ref={main} id={`${id}-main`} tabIndex={-1} className="cy-app-shell-main cy-reset">
        {children}
      </main>
      {nav && narrow && (
        <Sheet open={drawer} onOpenChange={setDrawer} side="start" size="sm" title={text.nav}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: delegated click from the links and buttons inside */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation of a link or button is a click too */}
          <div className="cy-app-shell-drawer cy-reset" onClick={onDrawerClick}>
            {nav}
          </div>
        </Sheet>
      )}
    </div>
  );
}
