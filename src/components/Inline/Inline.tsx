import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { Stack } from "../Stack/Stack.js";
import type { LayoutAttributes, PaddingProps, Space, VisibilityProps } from "../Stack/space.js";

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

/** Horizontal layout with token gaps: a Stack in a row, its children centred unless `align` says otherwise. */
export const Inline = forwardRef<HTMLElement, InlineProps>(function Inline(
  { gap = "3", wrap = false, className, ...rest },
  ref,
) {
  return (
    <Stack
      ref={ref}
      {...rest}
      gap={gap}
      direction="row"
      className={`cy-inline${className ? ` ${className}` : ""}`}
      data-wrap={wrap ? "" : undefined}
    />
  );
});
