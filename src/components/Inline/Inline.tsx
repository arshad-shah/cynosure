import { type CSSProperties, type ElementType, forwardRef, type ReactNode } from "react";
import {
  type LayoutAttributes,
  type PaddingProps,
  paddingVars,
  type Space,
  space,
  type VisibilityProps,
  visibilityAttrs,
} from "../Stack/space.js";

export interface InlineProps extends PaddingProps, VisibilityProps, LayoutAttributes {
  /** Space token between children. */
  gap?: Space;
  /** Cross-axis alignment of children. They are centred when it is not set. */
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  /** How children are spread along the row. */
  justify?: "start" | "center" | "end" | "between";
  /** Wrap onto new lines when space runs out. */
  wrap?: boolean;
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

/** Horizontal layout with token gaps. */
export const Inline = forwardRef<HTMLElement, InlineProps>(function Inline(
  {
    gap = "3",
    padding,
    paddingInline,
    paddingBlock,
    align,
    justify,
    wrap = false,
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
      className={`cy-inline${className ? ` ${className}` : ""}`}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? "" : undefined}
      {...visibilityAttrs({ hideBelow, hideAbove })}
      style={
        {
          "--_gap": space(gap),
          ...paddingVars({ padding, paddingInline, paddingBlock }),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
});
