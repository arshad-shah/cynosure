import { type CSSProperties, forwardRef, type ReactNode } from "react";

export interface HeadingTokens {
  /** Font size of `size="xs"` (the default for level 6). */
  sizeXs: string;
  /** Font size of `size="sm"` (the default for level 5). */
  sizeSm: string;
  /** Font size of `size="md"` (the default for level 4). */
  sizeMd: string;
  /** Font size of `size="lg"` (the default for level 3). */
  sizeLg: string;
  /** Font size of `size="xl"` (the default for level 2). */
  sizeXl: string;
  /** Font size of `size="2xl"` (the default for level 1). */
  "size-2xl": string;
  /** Font size of `size="3xl"`, between 2xl and display: a section page's title, fixed at 1.4 times 2xl. */
  "size-3xl": string;
  /** Font size of `size="display"`, a page's hero title. Grows with the viewport between 1.25 and 2 times 2xl. */
  sizeDisplay: string;
  /** Font family. Falls back to the display font. */
  fontFamily: string;
  /** Weight of bold headings (the default weight). */
  fontWeight: string;
  /** Line height, as a number. Tighter than body text. */
  lineHeight: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    heading: HeadingTokens;
  }
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "display";

export interface HeadingProps {
  /** The element rendered (`h1` to `h6`) and so the heading's place in the page outline. Default 2. */
  level?: HeadingLevel;
  /**
   * How large it looks, whatever its level. Defaults to the level's size: 1 is "2xl", 2 is "xl", 3 is "lg",
   * 4 is "md", 5 is "sm" and 6 is "xs". "3xl" is 1.4 times "2xl" at every width; "display" is larger still and grows with the viewport, for a page's hero title.
   */
  size?: HeadingSize;
  /** Text colour: the ink colour, muted, the accent, or whatever the parent uses. Default "neutral". */
  tone?: "inherit" | "neutral" | "muted" | "accent";
  /** Font weight. Default "bold". */
  weight?: "medium" | "bold";
  /** Text alignment, RTL aware. Left unset, it follows the parent. */
  align?: "start" | "center" | "end";
  /** `true` keeps it on one line and ends it with an ellipsis; a number cuts it after that many lines. Default false. */
  truncate?: boolean | number;
  /** Set on the heading element, for `aria-labelledby` and links to the section. */
  id?: string;
  /** Added to the heading element, for layout. */
  className?: string;
  /** Layout only. Restyle through `--cy-heading-*` tokens. */
  style?: CSSProperties;
  /** The heading's text. */
  children?: ReactNode;
}

const SIZE_BY_LEVEL = ["2xl", "xl", "lg", "md", "sm", "xs"] as const;

/** A section or page heading. `level` sets the element, `size` sets the look, so the outline stays correct. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  {
    level = 2,
    size,
    tone = "neutral",
    weight = "bold",
    align,
    truncate = false,
    id,
    className,
    style,
    children,
  },
  ref,
) {
  const Tag = `h${level}` as "h1";
  const lines = typeof truncate === "number" && truncate > 0 ? Math.floor(truncate) : 0;
  return (
    <Tag
      ref={ref}
      id={id}
      className={`cy-heading${className ? ` ${className}` : ""}`}
      data-size={size ?? SIZE_BY_LEVEL[level - 1]}
      data-tone={tone}
      data-weight={weight}
      data-align={align}
      data-truncate={lines ? "lines" : truncate === true ? "line" : undefined}
      style={lines ? ({ "--_lines": lines, ...style } as CSSProperties) : style}
    >
      {children}
    </Tag>
  );
});
