import { type CSSProperties, type ElementType, forwardRef, type ReactNode } from "react";

type Space = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

export interface StackProps {
  /** Space token between children. */
  gap?: Space;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";

  /** Neutral layout element to render (never an interactive one). */
  as?: "div" | "section" | "ul" | "ol" | "nav" | "aside" | "header" | "footer" | "span";
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  children?: ReactNode;
  "data-testid"?: string;
}

/** Vertical layout with token gaps. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { gap = "4", align, justify, as = "div", className, style, children, ...rest },
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
      style={{ "--_gap": `var(--cy-space-${gap})`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
});
