import { type CSSProperties, forwardRef, type ReactNode, useId } from "react";
import { Container, type ContainerProps } from "../Container/Container.js";
import { Heading } from "../Heading/Heading.js";
import { Link } from "../Link/Link.js";
import { Text } from "../Text/Text.js";

export interface SiteFooterTokens {
  /** Background of the footer. */
  background: string;
  /** Colour of the hairline above the footer and above its bottom row. */
  border: string;
  /** Space above and below the footer's content, and between its rows. */
  paddingBlock: string;
  /** Least width of a link column before the columns wrap onto another row. */
  columnMinWidth: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    siteFooter: SiteFooterTokens;
  }
}

/** A column of footer links under a heading. */
export interface SiteFooterColumn {
  /** The column's heading, e.g. "Product". */
  title: string;
  /** The column's links, in order. */
  links: {
    /** The link text. */
    label: string;
    /** Where it goes. */
    href: string;
    /** Opens in a new tab, with an icon and announced text. */
    external?: boolean;
  }[];
}

export interface SiteFooterLabels {
  /** Name of the navigation landmark that holds the link columns. Default: "Footer". */
  nav: string;
}

export interface SiteFooterProps {
  /** The logo or the site's name, at the top of the inline start. */
  brand?: ReactNode;
  /** A sentence under the brand about the site or the company. */
  tagline?: ReactNode;
  /** Link columns, as data: a heading and its links. They sit side by side and wrap onto more rows when narrow. */
  columns?: SiteFooterColumn[];
  /** Heading level of the column titles, to fit the page outline. Default 2. */
  headingLevel?: 2 | 3 | 4;
  /** The bottom row's start: copyright and legal links. */
  legal?: ReactNode;
  /** The bottom row's end: links to the site's social accounts, usually IconButtons with `href`. */
  social?: ReactNode;
  /** Widest the content gets: the `size` of its Container, to line up with the page. Default "lg". */
  size?: ContainerProps["size"];
  /** Replace the built-in English text: `nav`, the name of the links' navigation landmark. */
  labels?: Partial<SiteFooterLabels>;
  /** Set on the `footer` element. */
  id?: string | undefined;
  /** Names the footer, when a page has more than one. */
  "aria-label"?: string | undefined;
  /** Added to the `footer` element, for layout. */
  className?: string | undefined;
  /** Layout only. Restyle through --cy-site-footer-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: SiteFooterLabels = { nav: "Footer" };

/**
 * The bottom of a website: the brand and a tagline, columns of links, and a bottom row for the copyright, legal links
 * and social links. Columns and rows stack on narrow screens.
 */
export const SiteFooter = forwardRef<HTMLElement, SiteFooterProps>(function SiteFooter(
  {
    brand,
    tagline,
    columns = [],
    headingLevel = 2,
    legal,
    social,
    size = "lg",
    labels,
    className,
    style,
    ...rest
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const top = brand || tagline || columns.length > 0;
  return (
    <footer ref={ref} {...rest} className={`cy-site-footer${className ? ` ${className}` : ""}`} style={style}>
      <Container size={size} className="cy-site-footer-inner">
        {top && (
          <div className="cy-site-footer-top cy-reset">
            {(brand || tagline) && (
              <div className="cy-site-footer-brand cy-reset">
                {brand && <div className="cy-site-footer-logo">{brand}</div>}
                {tagline && (
                  <Text as="p" tone="muted" className="cy-site-footer-tagline">
                    {tagline}
                  </Text>
                )}
              </div>
            )}
            {columns.length > 0 && (
              <nav aria-label={text.nav} className="cy-site-footer-nav cy-reset">
                {columns.map((column, i) => (
                  <div key={column.title} className="cy-site-footer-column cy-reset">
                    <Heading
                      level={headingLevel}
                      size="xs"
                      id={`${id}-${i}`}
                      className="cy-site-footer-title"
                    >
                      {column.title}
                    </Heading>
                    <ul aria-labelledby={`${id}-${i}`} className="cy-site-footer-links cy-reset">
                      {column.links.map((link) => (
                        <li key={link.href} className="cy-site-footer-item cy-reset">
                          <Link
                            href={link.href}
                            tone="neutral"
                            size="md"
                            external={link.external ?? false}
                            className="cy-site-footer-link"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            )}
          </div>
        )}
        {(legal || social) && (
          <div className="cy-site-footer-bottom cy-reset" data-divided={top ? "" : undefined}>
            {legal && <div className="cy-site-footer-legal">{legal}</div>}
            {social && <div className="cy-site-footer-social cy-reset">{social}</div>}
          </div>
        )}
      </Container>
    </footer>
  );
});
