import { type CSSProperties, type ElementType, forwardRef, type ReactNode } from "react";
import {
  type LayoutAttributes,
  type Space,
  space,
  type VisibilityProps,
  visibilityAttrs,
} from "../../foundations/layout.js";

export interface ContainerTokens {
  /** Widest a `size="sm"` container gets, gutters included. */
  sizeSm: string;
  /** Widest a `size="md"` container gets, gutters included. */
  sizeMd: string;
  /** Widest a `size="lg"` container gets, gutters included. */
  sizeLg: string;
  /** Widest a `size="xl"` container gets, gutters included. */
  sizeXl: string;
  /** Side gutters when the `padding` prop is not set. */
  padding: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    container: ContainerTokens;
  }
}

export interface ContainerProps extends VisibilityProps, LayoutAttributes {
  /** Widest the column gets, gutters included; `full` has no limit. Default "lg". */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /**
   * Space token for the gutters at the inline start and end. They never get narrower than the device's safe area
   * (a phone's notch or rounded corners). Default: the `--cy-container-padding` token (space 6).
   */
  padding?: Space | undefined;
  /** Space token of padding at the block start and end (top and bottom). Default: none. */
  paddingBlock?: Space | undefined;
  /** Centre the column in the space around it. `false` keeps it at the inline start. Default true. */
  center?: boolean;
  /** Element to render: `main` for the page's main content, once per page. Default "div". */
  as?: "div" | "main" | "section" | "article";
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Change the widths through the --cy-container-* tokens. */
  style?: CSSProperties;
  /** The page content. */
  children?: ReactNode;
  /** Set on the root element, for tests. */
  "data-testid"?: string;
}

/** The page column: centres its content, caps its width and adds side gutters, so every page lines up. */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  {
    size = "lg",
    padding,
    paddingBlock,
    center = true,
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
  const vars: Record<string, string> = {};
  if (padding) vars["--_pad-inline"] = space(padding);
  if (paddingBlock) vars["--_pad-block"] = space(paddingBlock);
  return (
    <Tag
      ref={ref}
      {...rest}
      className={`cy-container${className ? ` ${className}` : ""}`}
      data-size={size}
      data-center={center ? "" : undefined}
      {...visibilityAttrs({ hideBelow, hideAbove })}
      style={{ ...vars, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
});
