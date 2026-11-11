import { type CSSProperties, type ElementType, forwardRef, type ReactNode } from "react";

type Space = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

export interface InlineProps {
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
  { gap = "3", align, justify, wrap = false, as = "div", className, style, children, ...rest },
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
      style={{ "--_gap": `var(--cy-space-${gap})`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
});
