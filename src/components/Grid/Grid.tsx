import { type CSSProperties, type ElementType, forwardRef, type ReactNode } from "react";
import {
  BREAKPOINTS as LAYOUT_BREAKPOINTS,
  type LayoutAttributes,
  type PaddingProps,
  paddingVars,
  type Space,
  space,
  type VisibilityProps,
  visibilityAttrs,
} from "../Stack/space.js";

/**
 * The widths at which a Grid with `columns` per breakpoint changes its column count. They are widths of the Grid's
 * own content box (inside its padding), not of the window. A breakpoint applies from its width upwards; `base`
 * applies below `sm`. `grid.css` repeats these values (CSS cannot read them from here): change both together.
 */
export const GRID_BREAKPOINTS = LAYOUT_BREAKPOINTS;

/** A named width of the Grid breakpoint scale. */
export type GridBreakpoint = keyof typeof GRID_BREAKPOINTS;

/** A value for each width of the grid: `base` below `sm`, then each breakpoint from its width upwards. */
export type GridResponsive<T> = { base?: T | undefined } & { [K in GridBreakpoint]?: T | undefined };

/** A column count for each width: `base` below `sm`, then each breakpoint from its width upwards. */
export type GridColumns = GridResponsive<number>;

const BREAKPOINTS = Object.keys(GRID_BREAKPOINTS) as GridBreakpoint[];

export interface GridProps extends PaddingProps, VisibilityProps, LayoutAttributes {
  /**
   * Number of equal columns, or a number per width of the grid itself: `{ base: 1, sm: 2, lg: 4 }`. A breakpoint that
   * is left out keeps the count of the one below it. With `minItemWidth` it is the most columns there can be.
   * A string is a CSS track list for columns of different widths at every width (`"2fr 1fr"`, `"16rem 1fr"`); for
   * unequal columns that change with the width, use equal columns per breakpoint and GridItem `span` per breakpoint.
   * Default 1.
   */
  columns?: number | GridColumns | string | undefined;
  /** Any CSS length. Columns are at least this wide: as many fit as the width allows, then items wrap. */
  minItemWidth?: string | undefined;
  /** Space token between items. */
  gap?: Space;
  /** Space token between rows. Default: `gap`. */
  rowGap?: Space;
  /** Block-axis alignment of items in their row. Default: stretch to the row's height. */
  align?: "start" | "center" | "end" | "stretch";
  /** Neutral layout element to render (never an interactive one). Use `ul` or `ol` with `GridItem as="li"`. */
  as?: "div" | "section" | "ul" | "ol" | "nav" | "aside" | "header" | "footer";
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** The items: any elements, or `GridItem` for ones that span columns or rows. */
  children?: ReactNode;
  /** Set on the root element, for tests. */
  "data-testid"?: string;
}

export interface GridItemProps extends VisibilityProps, LayoutAttributes {
  /**
   * Columns the item spans, or `full` for the whole row. Clamped to the columns the grid has at its current width.
   * In a grid with `columns` per breakpoint it can be one per breakpoint too (`{ base: "full", md: 2 }`), measured on
   * the grid's width; a breakpoint that is left out keeps the span of the one below it.
   */
  span?: number | "full" | GridResponsive<number | "full">;
  /**
   * Visual position among its siblings (CSS `order`; lower comes first), or one per breakpoint in a grid with
   * `columns` per breakpoint (`{ base: 2, md: 1 }` puts it first from `md` up). The reading and tab order stay the
   * source order, so only move things whose order does not matter to understanding them. Default 0.
   */
  order?: number | GridResponsive<number>;
  /**
   * Stay in view while the page scrolls past it (`position: sticky`), within its row: a sidebar beside a long
   * column. The item keeps its own height instead of stretching to the row's.
   */
  sticky?: boolean | undefined;
  /** With `sticky`: any CSS length between the top of the scrolling area and the item, e.g. a header's height. Default 0. */
  stickyOffset?: string | undefined;
  /** Rows the item spans. */
  rowSpan?: number;
  /** Neutral layout element to render (never an interactive one). Default "div". */
  as?: "div" | "li" | "section" | "article" | "aside";
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** The item's content. */
  children?: ReactNode;
  /** Set on the root element, for tests. */
  "data-testid"?: string;
}

const count = (n: number | undefined) => (n && n >= 1 ? Math.floor(n) : undefined);

// Custom properties inherit: unset ones are reset to `initial` so a nested Grid never picks up its parent's values.

/** Two-dimensional layout: a fixed number of columns, or as many as fit at a minimum width. */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  {
    columns,
    minItemWidth,
    gap = "4",
    rowGap,
    padding,
    paddingInline,
    paddingBlock,
    align,
    hideBelow,
    hideAbove,
    as = "div",
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Tag = as as ElementType;
  const responsive = typeof columns === "object" && columns !== null;
  const tracks = typeof columns === "string" && columns.trim() ? columns : undefined;
  const perWidth: Record<string, number> = {};
  let cols = count(responsive ? columns.base : typeof columns === "number" ? columns : undefined);
  if (responsive) {
    // One count per breakpoint, each falling back to the one below, so the CSS never has to chain fallbacks.
    cols ??= 1;
    let current = cols;
    for (const name of BREAKPOINTS) {
      current = count(columns[name]) ?? current;
      perWidth[`--_cols-${name}`] = current;
    }
  }
  return (
    <Tag
      ref={ref}
      {...rest}
      className={className ? `cy-grid ${className}` : "cy-grid"}
      data-fit={minItemWidth ? "" : undefined}
      data-responsive={responsive ? "" : undefined}
      data-tracks={tracks ? "" : undefined}
      data-align={align}
      {...visibilityAttrs({ hideBelow, hideAbove })}
      style={
        {
          "--_gap": space(gap),
          "--_row-gap": space(rowGap ?? gap),
          "--_cols": cols ?? "initial",
          "--_tracks": tracks ?? "initial",
          "--_min": minItemWidth ?? "initial",
          ...perWidth,
          ...paddingVars({ padding, paddingInline, paddingBlock }),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
});

/** A breakpoint value for each width, each falling back to the one below, as `--_<name>-<breakpoint>` properties. */
function perBreakpoint<T>(
  name: string,
  value: GridResponsive<T>,
  base: T,
  cast: (v: T) => number | undefined,
) {
  const vars: Record<string, number> = {};
  let current = cast(value.base ?? base) ?? 0;
  vars[`--_${name}-base`] = current;
  for (const bp of BREAKPOINTS) {
    const v = value[bp];
    if (v !== undefined) current = cast(v) ?? current;
    vars[`--_${name}-${bp}`] = current;
  }
  return vars;
}

/** "full" per breakpoint: more columns than any grid has, clamped by the grid to the whole row. */
const spanOf = (v: number | "full") => (v === "full" ? 1000 : count(v));

/** A Grid child that spans several columns or rows, moves, or sticks. Plain children need no wrapper. */
export const GridItem = forwardRef<HTMLElement, GridItemProps>(function GridItem(
  {
    span,
    rowSpan,
    order,
    sticky,
    stickyOffset,
    hideBelow,
    hideAbove,
    as = "div",
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Tag = as as ElementType;
  const spanSteps = typeof span === "object" && span !== null;
  const orderSteps = typeof order === "object" && order !== null;
  const cols = span === "full" || spanSteps ? undefined : count(span);
  return (
    <Tag
      ref={ref}
      {...rest}
      className={className ? `cy-grid-item ${className}` : "cy-grid-item"}
      data-full={span === "full" ? "" : undefined}
      data-span-steps={spanSteps ? "" : undefined}
      data-order-steps={orderSteps ? "" : undefined}
      data-sticky={sticky ? "" : undefined}
      {...visibilityAttrs({ hideBelow, hideAbove })}
      style={
        {
          "--_span": cols ?? "initial",
          "--_row-span": count(rowSpan) ?? "initial",
          ...(spanSteps ? perBreakpoint("span", span, 1, spanOf) : {}),
          ...(orderSteps
            ? perBreakpoint("order", order, 0, (v) => (Number.isFinite(v) ? Math.trunc(v) : undefined))
            : typeof order === "number" && Number.isFinite(order)
              ? { order: Math.trunc(order) }
              : {}),
          ...(sticky && stickyOffset ? { "--_sticky-top": stickyOffset } : {}),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
});
