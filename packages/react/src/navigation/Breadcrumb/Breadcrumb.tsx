import { ChevronRight, EllipsisIcon } from 'lucide-react';
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  Children,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactElement,
  type ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react';
import { IconButton } from '../../forms/IconButton/IconButton.js';
import { cn } from '../../utils/cn.js';
import {
  breadcrumbEllipsisButton,
  breadcrumbItem,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbPage,
  breadcrumbRoot,
  breadcrumbSeparator,
} from './Breadcrumb.css.js';

/**
 * Props for the breadcrumb trail root.
 */
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /**
   * Element rendered between items. Defaults to a small Lucide
   * `ChevronRight` glyph.
   */
  separator?: ReactNode;
  /**
   * Collapse middle items when the total exceeds this count. Omit for an
   * uncollapsed trail.
   */
  maxItems?: number;
  /**
   * Items kept visible at the start of the trail when collapsing.
   * @default 1
   */
  itemsBeforeCollapse?: number;
  /**
   * Items kept visible at the end of the trail when collapsing.
   * @default 2
   */
  itemsAfterCollapse?: number;
  /**
   * Custom collapsed-items trigger. Defaults to a `BreadcrumbEllipsis`
   * button — replace with e.g. a `DropdownMenu` listing the hidden links.
   */
  renderCollapsed?: (hiddenItems: ReactElement[]) => ReactNode;
  /**
   * Accessible label on the wrapping `<nav>`.
   * @default "Breadcrumb"
   */
  'aria-label'?: string;
}

/**
 * `<nav aria-label>` wrapping an ordered list of items. Separators are
 * interleaved automatically so consumers don't have to remember to add them;
 * if a `BreadcrumbSeparator` is passed as a child it's respected as-is.
 *
 * When `maxItems` is set and exceeded, middle items collapse into a single
 * `BreadcrumbEllipsis` element (or the output of `renderCollapsed`).
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  {
    children,
    separator,
    maxItems,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 2,
    renderCollapsed,
    className,
    'aria-label': ariaLabel = 'Breadcrumb',
    ...rest
  },
  ref,
) {
  // Normalise — only keep BreadcrumbItem elements; consumers might intersperse
  // their own separators but the typical use case lets us drive them.
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const sep = separator ?? <ChevronRight size={12} />;

  let visibleItems = items;
  let collapsedItems: ReactElement[] = [];
  if (maxItems && items.length > maxItems) {
    const before = items.slice(0, itemsBeforeCollapse);
    const after = items.slice(items.length - itemsAfterCollapse);
    collapsedItems = items.slice(itemsBeforeCollapse, items.length - itemsAfterCollapse);
    visibleItems = [...before, ...after];
  }

  const interleaved: ReactNode[] = [];
  visibleItems.forEach((item, index) => {
    if (index > 0) {
      interleaved.push(
        <BreadcrumbSeparator key={`sep-${(item.key ?? index).toString()}`}>
          {sep as ReactNode}
        </BreadcrumbSeparator>,
      );
    }
    interleaved.push(cloneElement(item, { key: item.key ?? `item-${index.toString()}` }));
    // Insert the collapsed placeholder exactly once, after the `before` group.
    if (collapsedItems.length > 0 && index === itemsBeforeCollapse - 1) {
      interleaved.push(
        <BreadcrumbSeparator key="sep-collapsed">{sep as ReactNode}</BreadcrumbSeparator>,
        <BreadcrumbItem key="collapsed">
          {renderCollapsed ? renderCollapsed(collapsedItems) : <BreadcrumbEllipsis />}
        </BreadcrumbItem>,
      );
    }
  });

  return (
    <nav ref={ref} aria-label={ariaLabel} className={cn(breadcrumbRoot, className)} {...rest}>
      <ol className={breadcrumbList}>{interleaved}</ol>
    </nav>
  );
});

/**
 * Props for a single breadcrumb trail entry (`<li>` wrapper).
 */
export interface BreadcrumbItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /**
   * Mark this entry as the current page. Sets `aria-current="page"` on
   * the `<li>` wrapper for assistive tech.
   * @default false
   */
  isCurrent?: boolean;
}

/**
 * Single trail entry. Wraps either a `BreadcrumbLink` (intermediate steps)
 * or a `BreadcrumbPage` (current page); pair `isCurrent` on this item with
 * `BreadcrumbPage` inside so both layers announce the current page.
 */
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ className, isCurrent, children, ...rest }, ref) {
    return (
      <li
        ref={ref}
        aria-current={isCurrent ? 'page' : undefined}
        className={cn(breadcrumbItem, className)}
        {...rest}
      >
        {children}
      </li>
    );
  },
);

/**
 * Props for the navigable anchor inside a breadcrumb entry.
 */
export interface BreadcrumbLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Reserved for future slot composition. Currently a no-op — the component
   * always renders an `<a>` element.
   */
  asChild?: boolean;
}

/**
 * Navigable anchor inside a `BreadcrumbItem`. Plain `<a>` underneath —
 * pair with your router's `<Link>` via the `href`/`onClick` props.
 */
export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ className, children, ...rest }, ref) {
    return (
      <a ref={ref} className={cn(breadcrumbLink, className)} {...rest}>
        {children}
      </a>
    );
  },
);

/**
 * Props for the non-link current-page element. Inherits all standard
 * `<span>` attributes.
 */
export interface BreadcrumbPageProps extends HTMLAttributes<HTMLSpanElement> {}

/**
 * Current page — non-link element that carries `aria-current="page"`. Pair
 * with `<BreadcrumbItem isCurrent>` so both the `<li>` and the inner element
 * announce the current page.
 */
export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  function BreadcrumbPage({ className, children, ...rest }, ref) {
    return (
      <span ref={ref} aria-current="page" className={cn(breadcrumbPage, className)} {...rest}>
        {children}
      </span>
    );
  },
);

/**
 * Props for the separator element rendered between breadcrumb entries.
 */
export interface BreadcrumbSeparatorProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * Custom separator glyph. Defaults to a small Lucide `ChevronRight`.
   */
  children?: ReactNode;
}

/**
 * Decorative separator between breadcrumb entries. Renders an
 * `aria-hidden`, `role="presentation"` `<li>` so the trail still reads as
 * a single ordered list to assistive tech.
 */
export const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  function BreadcrumbSeparator({ className, children, ...rest }, ref) {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn(breadcrumbSeparator, className)}
        {...rest}
      >
        {children ?? <ChevronRight size={12} />}
      </li>
    );
  },
);

/**
 * Props for the collapsed-items button rendered when `maxItems` is
 * exceeded.
 */
export interface BreadcrumbEllipsisProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Accessible label for the icon-only ellipsis button.
   * @default "Show more"
   */
  label?: string;
}

/**
 * Collapsed middle-items trigger. Renders as a button so consumers can wire
 * it to a `DropdownMenu` showing the hidden links.
 */
export const BreadcrumbEllipsis = forwardRef<HTMLButtonElement, BreadcrumbEllipsisProps>(
  function BreadcrumbEllipsis({ className, label = 'Show more', type, ...rest }, ref) {
    return (
      <IconButton
        ref={ref}
        variant="bare"
        type={type}
        label={label}
        icon={<EllipsisIcon />}
        className={cn(breadcrumbEllipsisButton, className)}
        {...rest}
      />
    );
  },
);
