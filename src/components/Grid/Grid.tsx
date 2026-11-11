import { type CSSProperties, type ElementType, forwardRef, type ReactNode } from "react";

type Space = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

export interface GridProps {
  /**
   * Fixed number of equal columns. With `minItemWidth` it is the most columns there can be; without it, the column
   * count does not change with the width.
   */
  columns?: number | undefined;
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
  /** Columns the item spans, or `full` for the whole row. Clamped to the columns there are. */
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
  { columns, minItemWidth, gap = "4", rowGap, align, as = "div", className, style, children, ...rest },
  ref,
) {
  const Tag = as as ElementType;
  const cols = count(columns);
  return (
    <Tag
      ref={ref}
      {...rest}
      className={className ? `cy-grid ${className}` : "cy-grid"}
      data-fit={minItemWidth ? "" : undefined}
      data-align={align}
      style={
        {
          "--_gap": `var(--cy-space-${gap})`,
          "--_row-gap": `var(--cy-space-${rowGap ?? gap})`,
          "--_cols": cols ?? "initial",
          "--_min": minItemWidth ?? "initial",
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
