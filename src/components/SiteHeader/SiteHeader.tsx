import { type CSSProperties, forwardRef, type ReactNode, useState } from "react";
import { LinkBase } from "../../foundations/LinkBase/LinkBase.js";
import { menu } from "../../icons/menu.js";
import { Container, type ContainerProps } from "../Container/Container.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Sheet } from "../Sheet/Sheet.js";
import { SideNav } from "../SideNav/SideNav.js";
import { SkipLink } from "../SkipLink/SkipLink.js";

export interface SiteHeaderTokens {
  /** Least height of the bar. */
  height: string;
  /** Background of the bar. A sticky bar mixes it with some transparency and blurs the page behind. */
  background: string;
  /** Colour of the hairline under the bar. */
  border: string;
  /** Blur of the page seen through a sticky bar. */
  blur: string;
  /** Text colour of the navigation links. */
  linkColor: string;
  /** Text colour of the link to the current page. */
  linkCurrentColor: string;
  /** Background of a hovered link and of the link to the current page. */
  linkHighlight: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    siteHeader: SiteHeaderTokens;
  }
}

/** One link of the site navigation. */
export interface SiteHeaderLink {
  /** The link text. */
  label: string;
  /** Where it goes. */
  href: string;
  /** This link is the page being shown: it is marked `aria-current="page"`. */
  current?: boolean;
}

export interface SiteHeaderLabels {
  /** Name of the navigation landmark, in the bar and in the menu. Default: "Main". */
  nav: string;
  /** The menu button shown on narrow screens. Default: "Open menu". */
  openMenu: string;
  /** Title of the menu sheet. Default: "Menu". */
  menu: string;
  /** The skip link. Default: "Skip to content". */
  skip: string;
}

export interface SiteHeaderProps {
  /** The logo or the site's name, at the inline start. Give a logo image its text alternative. */
  brand?: ReactNode;
  /** Where the brand links to. `false` shows the brand without a link. Default "/". */
  brandHref?: string | false;
  /** The site navigation, as data. Each link is a real link; the `current` one is marked for assistive technology. */
  nav?: SiteHeaderLink[];
  /** Controls at the inline end, such as a ThemeToggle, a search button or a sign-in Button. They stay in the bar. */
  actions?: ReactNode;
  /** Keep the bar at the top of the window while the page scrolls, over a blurred view of the page. Default true. */
  sticky?: boolean;
  /** Render a SkipLink before the bar, the first stop of the Tab order. Default true. */
  skipLink?: boolean;
  /** Where the skip link goes: `#` and the id of the page's main content. Default "#main". */
  skipTo?: string;
  /**
   * Width of the header below which the navigation moves into a menu opened from a button: `sm` 40rem, `md` 48rem,
   * `lg` 64rem. CSS only, so the right layout shows before any script runs. Default "md".
   */
  collapseBelow?: "sm" | "md" | "lg";
  /** Widest the bar's content gets: the `size` of its Container, to line up with the page. Default "lg". */
  size?: ContainerProps["size"];
  /** Replace the built-in English text: the landmark name, the menu button, the menu title and the skip link. */
  labels?: Partial<SiteHeaderLabels>;
  /** Set on the `header` element. */
  id?: string | undefined;
  /** Added to the `header` element, for layout. */
  className?: string | undefined;
  /** Layout only. Restyle through --cy-site-header-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: SiteHeaderLabels = {
  nav: "Main",
  openMenu: "Open menu",
  menu: "Menu",
  skip: "Skip to content",
};

/**
 * The top bar of a website that scrolls as a document: a skip link, the brand, the site navigation and actions. On
 * narrow screens the navigation moves into a menu sheet. For an app frame with a side navigation, use AppShell.
 */
export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader(
  {
    brand,
    brandHref = "/",
    nav = [],
    actions,
    sticky = true,
    skipLink = true,
    skipTo = "#main",
    collapseBelow = "md",
    size = "lg",
    labels,
    id,
    className,
    style,
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [open, setOpen] = useState(false);
  const current = nav.findIndex((item) => item.current);

  return (
    <>
      {/* Before the header, not in it: a sticky header's blur would make the link's fixed position relative to it. */}
      {skipLink && <SkipLink href={skipTo} labels={{ skip: text.skip }} />}
      <header
        ref={ref}
        id={id}
        className={`cy-site-header${className ? ` ${className}` : ""}`}
        data-sticky={sticky ? "" : undefined}
        data-collapse={collapseBelow}
        style={style}
      >
        <Container size={size} className="cy-site-header-bar">
          {brand &&
            (brandHref === false ? (
              <div className="cy-site-header-brand">{brand}</div>
            ) : (
              <LinkBase href={brandHref} className="cy-site-header-brand">
                {brand}
              </LinkBase>
            ))}
          {nav.length > 0 && (
            <nav aria-label={text.nav} className="cy-site-header-nav cy-reset">
              <ul className="cy-site-header-list cy-reset">
                {nav.map((item) => (
                  <li key={item.href} className="cy-site-header-item cy-reset">
                    <LinkBase
                      href={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className="cy-site-header-link"
                    >
                      {item.label}
                    </LinkBase>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {actions && <div className="cy-site-header-actions cy-reset">{actions}</div>}
          {nav.length > 0 && (
            <div className="cy-site-header-menu cy-reset">
              <IconButton
                icon={menu}
                label={text.openMenu}
                variant="ghost"
                tone="neutral"
                tooltipPlacement="bottom"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              />
            </div>
          )}
        </Container>
      </header>
      {nav.length > 0 && (
        <Sheet open={open} onOpenChange={setOpen} side="end" size="sm" title={text.menu}>
          <SideNav
            label={text.nav}
            items={nav.map((item, i) => ({ id: String(i), label: item.label, href: item.href }))}
            current={current < 0 ? undefined : String(current)}
            // Choosing a link closes the menu; the browser then follows it.
            onNavigate={() => setOpen(false)}
            className="cy-site-header-sheet-nav"
          />
        </Sheet>
      )}
    </>
  );
});
