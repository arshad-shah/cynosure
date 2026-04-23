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

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Separator element rendered between items. Defaults to a chevron. */
  separator?: ReactNode;
  /** Collapse middle items when the total exceeds this count. */
  maxItems?: number;
  /** Items kept visible at the start of the trail (default 1). */
  itemsBeforeCollapse?: number;
  /** Items kept visible at the end of the trail (default 2). */
  itemsAfterCollapse?: number;
  /** Render a custom collapsed-items trigger (replaces the default Ellipsis). */
  renderCollapsed?: (hiddenItems: ReactElement[]) => ReactNode;
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

export interface BreadcrumbItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /** Mark the current page. Sets `aria-current="page"` on the wrapper. */
  isCurrent?: boolean;
}

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

export interface BreadcrumbLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** If true, renders a `<span>` with the current-page styling (no anchor). */
  asChild?: boolean;
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ className, children, ...rest }, ref) {
    return (
      <a ref={ref} className={cn(breadcrumbLink, className)} {...rest}>
        {children}
      </a>
    );
  },
);

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

export interface BreadcrumbSeparatorProps extends HTMLAttributes<HTMLLIElement> {
  children?: ReactNode;
}

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

export interface BreadcrumbEllipsisProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
