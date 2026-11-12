import { type CSSProperties, type ElementType, forwardRef, type ReactNode } from "react";
import {
  type LayoutAttributes,
  type PaddingProps,
  paddingVars,
  type Space,
  space,
  type VisibilityProps,
  visibilityAttrs,
} from "./space.js";

export interface StackProps extends PaddingProps, VisibilityProps, LayoutAttributes {
  /** Space token between children. */
  gap?: Space;
  /** How children line up across the stack (horizontally). */
  align?: "start" | "center" | "end" | "stretch";
  /** How children are spread along the stack (vertically); `between` pushes them apart. */
  justify?: "start" | "center" | "end" | "between";

  /**
   * Stay in view while the page scrolls past (`position: sticky`), inside its parent. In a Grid, make the GridItem
   * sticky instead, or give the Grid `align="start"`: a box stretched to its row has nowhere to move.
   */
  sticky?: boolean | undefined;
  /** With `sticky`: any CSS length between the top of the scrolling area and the box, e.g. a header's height. Default 0. */
  stickyOffset?: string | undefined;
  /** Neutral layout element to render (never an interactive one). */
  as?: "div" | "section" | "ul" | "ol" | "nav" | "aside" | "header" | "footer" | "span";
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** The items to stack. */
  children?: ReactNode;
  /** Passed to the root element, for tests. */
  "data-testid"?: string;
}

/** Vertical layout with token gaps. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    gap = "4",
    padding,
    paddingInline,
    paddingBlock,
    align,
    justify,
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
  return (
    <Tag
      ref={ref}
      {...rest}
      className={`cy-stack${className ? ` ${className}` : ""}`}
      data-align={align}
      data-justify={justify}
      data-sticky={sticky ? "" : undefined}
      {...visibilityAttrs({ hideBelow, hideAbove })}
      style={
        {
          "--_gap": space(gap),
          ...(sticky && stickyOffset ? { "--_sticky-top": stickyOffset } : {}),
          ...paddingVars({ padding, paddingInline, paddingBlock }),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
});
