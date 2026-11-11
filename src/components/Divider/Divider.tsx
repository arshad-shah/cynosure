import { type CSSProperties, forwardRef, type ReactNode, useId } from "react";

export interface DividerTokens {
  /** Thickness of the line. */
  thickness: string;
  /** Line colour of the neutral tone. */
  color: string;
  /** Line colour of the strong tone. */
  colorStrong: string;
  /** Space between the label and the line on each side of it. */
  labelGap: string;
  /** Text colour of the label. */
  labelColor: string;
  /** Text size of the label. */
  labelSize: string;
  /** Space around the line with `spacing="sm"`. */
  spacingSm: string;
  /** Space around the line with `spacing="md"`. */
  spacingMd: string;
  /** Space around the line with `spacing="lg"`. */
  spacingLg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    divider: DividerTokens;
  }
}

export interface DividerProps {
  /**
   * Direction of the line. A horizontal divider fills the width of its container; a vertical one stretches to the
   * height of its flex row (Inline, Toolbar). Default "horizontal".
   */
  orientation?: "horizontal" | "vertical";
  /** Line style. Default "solid". */
  variant?: "solid" | "dashed";
  /** Line colour: the quiet line colour, or a stronger one for emphasis. Default "neutral". */
  tone?: "neutral" | "strong";
  /**
   * Space around the line along the flow: above and below a horizontal divider, before and after a vertical one.
   * Stack and Inline gaps usually provide it. Default "none".
   */
  spacing?: "none" | "sm" | "md" | "lg";
  /** Where the label sits along a horizontal line (follows the text direction). Default "center". */
  labelAlign?: "start" | "center" | "end";
  /**
   * Purely visual: not exposed as a separator. With `false` it has `role="separator"` and its label is its
   * accessible name. Default true.
   */
  decorative?: boolean;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through `--cy-divider-*` tokens. */
  style?: CSSProperties;
  /** A short label drawn in the line ("or"). Horizontal only: a vertical divider ignores it. */
  children?: ReactNode;
  /** Set on the root element, to find it in tests. */
  "data-testid"?: string;
}

/** A line that separates content, horizontal or vertical, with an optional label in the middle. */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  {
    orientation = "horizontal",
    variant = "solid",
    tone = "neutral",
    spacing = "none",
    labelAlign = "center",
    decorative = true,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const labelId = useId();
  const vertical = orientation === "vertical";
  const labelled = !vertical && children != null && children !== false && children !== "";
  // A separator's content is presentational, so its label is given as its name. Horizontal is the role's default
  // orientation, so only vertical is stated.
  const semantics = decorative
    ? ({ role: "none" } as const)
    : ({
        role: "separator",
        "aria-orientation": vertical ? "vertical" : undefined,
        "aria-labelledby": labelled ? labelId : undefined,
      } as const);
  return (
    <div
      ref={ref}
      {...rest}
      {...semantics}
      className={`cy-divider${className ? ` ${className}` : ""}`}
      data-orientation={orientation}
      data-variant={variant}
      data-tone={tone}
      data-spacing={spacing}
      data-label={labelled ? labelAlign : undefined}
      style={style}
    >
      {labelled && (
        <span id={labelId} className="cy-reset cy-divider-label">
          {children}
        </span>
      )}
    </div>
  );
});
