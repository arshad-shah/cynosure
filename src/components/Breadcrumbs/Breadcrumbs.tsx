import { type CSSProperties, forwardRef, type MouseEvent, useRef } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { chevronRight } from "../../icons/chevron-right.js";
import { moreHorizontal } from "../../icons/more-horizontal.js";
import type { IconData } from "../../icons/types.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Link } from "../Link/Link.js";
import { Menu } from "../Menu/Menu.js";

export interface BreadcrumbsTokens {
  /** Space between crumbs and separators. */
  gap: string;
  /** Widest a single crumb's label gets before it is cut with an ellipsis. */
  itemMaxWidth: string;
  /** Colour of the separators. */
  separatorColor: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    breadcrumbs: BreadcrumbsTokens;
  }
}

export interface BreadcrumbItem {
  /** The page's name. */
  label: string;
  /** Where the crumb goes: it becomes a link. Ignored on the last item (the current page). */
  href?: string;
  /**
   * Called when the crumb is chosen, in the trail or in the menu of hidden items. With `href`, call
   * `event.preventDefault()` to route on the client. Without `href` the crumb is a button.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** A Facet icon before the label. */
  icon?: IconData;
}

export interface BreadcrumbsProps {
  /** The trail, from the top of the site to the current page. The last item is the current page. */
  items: BreadcrumbItem[];
  /**
   * Most crumbs to show. With more items, the first one and the last `maxItems - 1` stay and the ones between go into
   * a menu behind a "more" button. Values under 2 count as 2. Default: every item is shown.
   */
  maxItems?: number;
  /** The icon between crumbs. It is decorative and mirrored in right-to-left text. Default `chevronRight`. */
  separator?: IconData;
  /** Text size. Default "md". */
  size?: "sm" | "md";
  /**
   * Replace the built-in English text: `nav` names the landmark (default "Breadcrumb"), `more` names the button and
   * the menu of hidden items (default "Show the full path").
   */
  labels?: { nav?: string; more?: string };
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-breadcrumbs-* tokens. */
  style?: CSSProperties;
}

/** The trail from the top of a site or app to the current page (APG breadcrumb): links, then the current page. */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, maxItems, separator = chevronRight, size = "md", labels, className, style },
  ref,
) {
  const list = useRef<HTMLOListElement>(null);
  const last = items.length - 1;
  const keep = Math.max(maxItems ?? items.length, 2);
  // Hidden when collapsed: everything between the first item and the last `keep - 1`.
  const hidden = (i: number) => items.length > keep && i > 0 && i <= last - (keep - 1);
  const more = labels?.more ?? "Show the full path";
  const sep = <Icon icon={separator} size="sm" className="cy-breadcrumbs-separator" />;

  const crumb = (item: BreadcrumbItem, i: number) => {
    const content = (
      <>
        {item.icon && <Icon icon={item.icon} />}
        <span className="cy-breadcrumbs-label cy-reset">{item.label}</span>
      </>
    );
    return (
      // Hidden crumbs stay in the DOM (out of the accessibility tree): the menu activates them, so a menu choice is
      // the same click as one in the trail.
      <li key={i} className="cy-breadcrumbs-item cy-reset" data-index={i} hidden={hidden(i)}>
        {i === last ? (
          <span className="cy-breadcrumbs-current cy-reset" aria-current="page">
            {content}
          </span>
        ) : item.href ? (
          <Link
            href={item.href}
            tone="neutral"
            size={size}
            className="cy-breadcrumbs-link"
            {...(item.onClick ? { onClick: item.onClick } : {})}
          >
            {content}
          </Link>
        ) : item.onClick ? (
          <Button
            variant="ghost"
            size={size}
            icon={item.icon}
            className="cy-breadcrumbs-link"
            onClick={item.onClick}
          >
            {item.label}
          </Button>
        ) : (
          <span className="cy-breadcrumbs-text cy-reset">{content}</span>
        )}
        {i < last && !hidden(i) && sep}
      </li>
    );
  };

  return (
    <nav
      ref={ref}
      aria-label={labels?.nav ?? "Breadcrumb"}
      className={`cy-breadcrumbs${className ? ` ${className}` : ""}`}
      data-size={size}
      style={style}
    >
      <ol ref={list} className="cy-breadcrumbs-list cy-reset">
        {items.map((item, i) =>
          i === 1 && hidden(1)
            ? [
                <li key="more" className="cy-breadcrumbs-item cy-reset">
                  <Menu
                    label={more}
                    trigger={(props) => (
                      <IconButton {...props} icon={moreHorizontal} label={more} variant="ghost" size="sm" />
                    )}
                    items={items.flatMap((entry, at) =>
                      hidden(at)
                        ? [
                            {
                              value: String(at),
                              label: entry.label,
                              disabled: !entry.href && !entry.onClick,
                              ...(entry.icon ? { icon: entry.icon } : {}),
                            },
                          ]
                        : [],
                    )}
                    onSelect={(at) =>
                      list.current
                        ?.querySelector<HTMLElement>(`[data-index="${at}"] > .cy-breadcrumbs-link`)
                        ?.click()
                    }
                  />
                  {sep}
                </li>,
                crumb(item, i),
              ]
            : crumb(item, i),
        )}
      </ol>
    </nav>
  );
});
