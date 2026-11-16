import { Children, type CSSProperties, forwardRef, type ReactNode } from "react";
import type {
  BoxProps,
  LayoutAttributes,
  PaddingProps,
  Space,
  VisibilityProps,
} from "../../foundations/layout.js";
import { Stack } from "../Stack/Stack.js";

export interface InlineTokens {
  /** Colour of the separators between items. */
  separatorColor: string;
  /** Diameter of a dot separator; a line separator is four times as tall. */
  separatorSize: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    inline: InlineTokens;
  }
}

export interface InlineProps extends PaddingProps, VisibilityProps, BoxProps, LayoutAttributes {
  /** Space token between children. */
  gap?: Space;
  /** Cross-axis alignment of children. They are centred when it is not set. */
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  /** How children are spread along the row. */
  justify?: "start" | "center" | "end" | "between";
  /** Wrap onto new lines when space runs out. */
  wrap?: boolean;
  /**
   * A mark between the children, for a meta line ("PDF · 3 pages · 1.2 MB"): `dot` or `line` (a thin upright rule),
   * drawn in the gap and hidden from assistive technology. Each child, text included, becomes one item (a list item
   * with `as="ul"` or `"ol"`); empty children are left out. Default: none.
   */
  separator?: "dot" | "line" | undefined;
  /** Neutral layout element to render (never an interactive one). */
  as?: "div" | "section" | "ul" | "ol" | "nav" | "aside" | "header" | "footer" | "span";
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** The elements to lay out in a row. */
  children?: ReactNode;
  /** Set on the root element, for tests. */
  "data-testid"?: string;
}

/** Horizontal layout with token gaps: a Stack in a row, its children centred unless `align` says otherwise. */
export const Inline = forwardRef<HTMLElement, InlineProps>(function Inline(
  { gap = "3", wrap = false, separator, className, children, ...rest },
  ref,
) {
  const Item = rest.as === "ul" || rest.as === "ol" ? "li" : "span";
  return (
    <Stack
      ref={ref}
      {...rest}
      gap={gap}
      direction="row"
      className={`cy-inline${className ? ` ${className}` : ""}`}
      data-wrap={wrap ? "" : undefined}
      data-separator={separator}
    >
      {separator
        ? Children.toArray(children).map((child, i) => (
            <Item
              key={typeof child === "object" && "key" in child && child.key != null ? child.key : i}
              className="cy-inline-item cy-reset"
            >
              {child}
            </Item>
          ))
        : children}
    </Stack>
  );
});
