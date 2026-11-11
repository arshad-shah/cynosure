import { type CSSProperties, type ElementType, forwardRef, type ReactNode } from "react";
import { type PaddingProps, paddingVars, type Space, space } from "../Stack/space.js";

/**
 * The widths at which a Grid with `columns` per breakpoint changes its column count. They are widths of the Grid's
 * own content box (inside its padding), not of the window. A breakpoint applies from its width upwards; `base`
 * applies below `sm`. `grid.css` repeats these values (CSS cannot read them from here): change both together.
 */
export const GRID_BREAKPOINTS = { sm: "30rem", md: "45rem", lg: "60rem", xl: "75rem" } as const;

/** A named width of the Grid breakpoint scale. */
export type GridBreakpoint = keyof typeof GRID_BREAKPOINTS;

/** A column count for each width: `base` below `sm`, then each breakpoint from its width upwards. */
export type GridColumns = { base?: number | undefined } & { [K in GridBreakpoint]?: number | undefined };

const BREAKPOINTS = Object.keys(GRID_BREAKPOINTS) as GridBreakpoint[];

export interface GridProps extends PaddingProps {
  /**
   * Number of equal columns, or a number per width of the grid itself: `{ base: 1, sm: 2, lg: 4 }`. A breakpoint that
   * is left out keeps the count of the one below it. With `minItemWidth` it is the most columns there can be.
   * Default 1.
   */
  columns?: number | GridColumns | undefined;
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

export interface GridItemProps {
  /** Columns the item spans, or `full` for the whole row. Clamped to the columns the grid has at its current width. */
  span?: number | "full";
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
  const perWidth: Record<string, number> = {};
  let cols = count(responsive ? columns.base : columns);
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
      data-align={align}
      style={
        {
          "--_gap": space(gap),
          "--_row-gap": space(rowGap ?? gap),
          "--_cols": cols ?? "initial",
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

/** A Grid child that spans several columns or rows. Plain children need no wrapper. */
export const GridItem = forwardRef<HTMLElement, GridItemProps>(function GridItem(
  { span, rowSpan, as = "div", className, style, children, ...rest },
  ref,
) {
  const Tag = as as ElementType;
  const cols = span === "full" ? undefined : count(span);
  return (
    <Tag
      ref={ref}
      {...rest}
      className={className ? `cy-grid-item ${className}` : "cy-grid-item"}
      data-full={span === "full" ? "" : undefined}
      style={
        {
          "--_span": cols ?? "initial",
          "--_row-span": count(rowSpan) ?? "initial",
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
});
