import { type CSSProperties, forwardRef, type MouseEvent, useRef } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { clamp } from "../../foundations/math.js";
import { chevronFirst } from "../../icons/chevron-first.js";
import { chevronLast } from "../../icons/chevron-last.js";
import { chevronLeft } from "../../icons/chevron-left.js";
import { chevronRight } from "../../icons/chevron-right.js";
import { moreHorizontal } from "../../icons/more-horizontal.js";
import type { IconData } from "../../icons/types.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface PaginationTokens {
  /** Space between the controls. */
  gap: string;
  /** Inline padding of a page number (its width is never less than its height). */
  pagePadding: string;
  /** Colour of the ellipsis and of the "Page 3 of 10" text. */
  mutedColor: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    pagination: PaginationTokens;
  }
}

export interface PaginationLabels {
  /** Name of the navigation landmark. */
  nav: string;
  /** Name of the previous-page control. */
  previous: string;
  /** Name of the next-page control. */
  next: string;
  /** Name of the first-page control. */
  first: string;
  /** Name of the last-page control. */
  last: string;
  /** Name of a page number. The current one also carries `aria-current="page"`, so do not add "current" here. */
  page: (page: number) => string;
  /** Text of the compact variant, also announced when the page changes. */
  status: (page: number, count: number) => string;
}

const LABELS: PaginationLabels = {
  nav: "Pagination",
  previous: "Previous page",
  next: "Next page",
  first: "First page",
  last: "Last page",
  page: (page) => `Page ${page}`,
  status: (page, count) => `Page ${page} of ${count}`,
};

const whole = (n: number, least: number) => Math.max(least, Math.floor(n) || 0);

/** How many pages `total` items make at `pageSize` items a page: never less than 1. */
export function pageCount(total: number, pageSize: number): number {
  return pageSize > 0 ? whole(Math.ceil(total / pageSize), 1) : 1;
}

/**
 * The pages to show for `page` of `count`, in order, with `"gap"` where pages are left out. `boundaries` pages are
 * always shown at each end and `siblings` each side of the current one. The list has the same length on every page
 * (so the controls do not move under the pointer), and a gap never stands for a single page.
 */
export function pageRange(page: number, count: number, siblings = 1, boundaries = 1): (number | "gap")[] {
  const last = whole(count, 0);
  const side = whole(siblings, 0);
  const edge = whole(boundaries, 0);
  const run = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (last <= edge * 2 + side * 2 + 3) return run(1, last);
  const from = clamp(page - side, edge + 2, last - edge - side * 2 - 1);
  const to = from + side * 2;
  return [
    ...run(1, edge),
    from > edge + 2 ? "gap" : edge + 1,
    ...run(from, to),
    to < last - edge - 1 ? "gap" : last - edge,
    ...run(last - edge + 1, last),
  ];
}

export interface PaginationProps {
  /** How many pages there are. From a number of items, use `pageCount(total, pageSize)`. One page or fewer renders nothing. */
  count: number;
  /** The current page, from 1 (controlled). Values outside 1 to `count` are clamped. */
  page?: number | undefined;
  /** The page shown first when uncontrolled. Default 1. */
  defaultPage?: number;
  /**
   * Called with the new page when a control is pressed, and with the click event. With `getHref`, a client-side router
   * calls `event.preventDefault()` here to stop the browser following the link, then navigates itself.
   */
  onChange?: ((page: number, event: MouseEvent<HTMLElement>) => void) | undefined;
  /** Pages shown each side of the current one. Default 1. */
  siblings?: number;
  /** Pages always shown at each end. Default 1. */
  boundaries?: number;
  /** `pages` shows numbered pages; `compact` shows only previous and next around "Page 3 of 10", for phones and tight spaces. Default "pages". */
  variant?: "pages" | "compact";
  /** Adds first-page and last-page controls. Default false. */
  showEdges?: boolean;
  /**
   * The address of a page. When given, every page number and every control that leads to another page is a real link
   * to it (works without JavaScript, opens in a new tab); the current page is a link with `aria-current="page"`.
   * `onChange` still fires on a plain click.
   */
  getHref?: ((page: number) => string) | undefined;
  /** Disables every control. Default false. */
  disabled?: boolean;
  /** Height and text size of the controls. Default "md". */
  size?: "sm" | "md";
  /** Replaces the built-in English strings. */
  labels?: Partial<PaginationLabels> | undefined;
  /** Added to the `nav` element, for layout. */
  className?: string | undefined;
  /** Layout only. Restyle through `--cy-pagination-*` tokens. */
  style?: CSSProperties | undefined;
}

/** Moves between the pages of a list or table: a `nav` landmark of Buttons, with the current page marked. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    count,
    page,
    defaultPage = 1,
    onChange,
    siblings = 1,
    boundaries = 1,
    variant = "pages",
    showEdges = false,
    getHref,
    disabled = false,
    size = "md",
    labels,
    className,
    style,
  },
  ref,
) {
  const text = { ...LABELS, ...labels };
  const last = whole(count, 1);
  const [value, setValue] = useControllableState(page, defaultPage);
  const current = clamp(Math.round(value) || 1, 1, last);
  const list = useRef<HTMLOListElement>(null);
  const pressed = useRef<Element | null>(null);

  // The pressed control had focus and can no longer hold it (previous on reaching page 1, where it is disabled or,
  // as a link, replaced by a button): focus goes to the current page, or to the control that still works.
  useClientLayoutEffect(() => {
    const from = pressed.current;
    pressed.current = null;
    if (!from || (from.isConnected && !from.matches(":disabled"))) return;
    const find = (selector: string) => list.current?.querySelector<HTMLElement>(selector);
    (find("[aria-current]") ?? find(".cy-button:not(:disabled)"))?.focus();
  });

  if (last <= 1) return null;

  const go = (to: number) => (event: MouseEvent<HTMLElement>) => {
    // A link opened in a new tab or window leaves this page where it is.
    if (getHref && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    const control = event.currentTarget;
    if ((control.getRootNode() as Document | ShadowRoot).activeElement === control) pressed.current = control;
    if (to === current) return;
    setValue(to);
    onChange?.(to, event);
  };
  const hrefTo = (to: number, off: boolean) => (off ? undefined : getHref?.(to));
  const step = (to: number, icon: IconData, label: string) => {
    const off = disabled || to === current;
    return (
      <li className="cy-reset cy-pagination-item">
        <IconButton
          icon={icon}
          label={label}
          size={size}
          variant="ghost"
          // Previous and next point the way the pages run in the reading direction.
          flipRtl
          disabled={off}
          href={hrefTo(to, off)}
          onClick={go(to)}
        />
      </li>
    );
  };

  return (
    <nav
      ref={ref}
      className={`cy-pagination${className ? ` ${className}` : ""}`}
      aria-label={text.nav}
      data-size={size}
      data-variant={variant}
      style={style}
    >
      <ol ref={list} className="cy-reset cy-pagination-list">
        {showEdges && step(1, chevronFirst, text.first)}
        {step(Math.max(1, current - 1), chevronLeft, text.previous)}
        {variant === "compact" ? (
          <li className="cy-reset cy-pagination-item">
            <span className="cy-reset cy-pagination-status" role="status">
              {text.status(current, last)}
            </span>
          </li>
        ) : (
          pageRange(current, last, siblings, boundaries).map((item, index) =>
            item === "gap" ? (
              // Not a control and nothing to read: the page names on each side already say what is left out.
              <li key={`gap-${index}`} className="cy-reset cy-pagination-gap" aria-hidden="true">
                <Icon icon={moreHorizontal} />
              </li>
            ) : (
              <li key={item} className="cy-reset cy-pagination-item">
                <Button
                  className="cy-pagination-page"
                  size={size}
                  variant={item === current ? "soft" : "ghost"}
                  tone={item === current ? "accent" : "neutral"}
                  aria-label={text.page(item)}
                  aria-current={item === current ? "page" : undefined}
                  disabled={disabled}
                  href={hrefTo(item, disabled)}
                  onClick={go(item)}
                >
                  {item}
                </Button>
              </li>
            ),
          )
        )}
        {step(Math.min(last, current + 1), chevronRight, text.next)}
        {showEdges && step(last, chevronLast, text.last)}
      </ol>
    </nav>
  );
});
