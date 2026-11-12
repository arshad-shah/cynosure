import { type CSSProperties, forwardRef, type ReactNode } from "react";
import type { Tone } from "../../tokens/schema.js";

export interface TextTokens {
  /** Line height of every variant. */
  lineHeight: string;
  /** Font size of the `lead` variant. */
  leadSize: string;
  /** Font size of the `caption` variant. */
  captionSize: string;
  /** Font size of the `eyebrow` variant. */
  eyebrowSize: string;
  /** Letter spacing of the `eyebrow` variant. */
  eyebrowTracking: string;
  /** Colour of `tone="muted"` and of the muted variants (lead, caption, eyebrow). */
  muted: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    text: TextTokens;
  }
}

export interface TextProps {
  /**
   * Element to render. `strong` is bold unless `weight` says otherwise; `p`, `div` and `figcaption` are blocks, the
   * rest are inline. Default "span".
   */
  as?: "span" | "p" | "div" | "label" | "strong" | "em" | "small" | "time" | "figcaption";
  /**
   * Preset: `lead` is larger muted intro text, `caption` is small and muted, `eyebrow` is the small uppercase tracked
   * label, `code` uses the mono face. A preset only sets defaults: `size`, `weight` and `tone` still win.
   * Default "body".
   */
  variant?: "body" | "lead" | "caption" | "eyebrow" | "code";
  /**
   * Font size, from the `--cy-font-size-*` tokens. Default: from the variant ("md" for body). A Text placed directly
   * inside another Text takes the outer size.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /**
   * Font weight. Default "regular" ("bold" for the eyebrow variant and for `as="strong"`). A Text placed directly
   * inside another Text takes the outer weight.
   */
  weight?: "regular" | "medium" | "bold";
  /**
   * Colour. `inherit` takes the surrounding colour, `neutral` is the ink, `muted` the secondary ink; the others are
   * the readable text colour of that tone. Default "inherit" ("muted" for lead, caption and eyebrow).
   */
  tone?: Tone | "inherit" | "muted";
  /** Horizontal alignment; `start` and `end` follow the reading direction. Makes an inline element a block. */
  align?: "start" | "center" | "end";
  /**
   * Cuts text that does not fit and ends it with an ellipsis: `true` keeps one line, a number keeps that many lines.
   * An inline element becomes an inline block (one line) or a block (several lines). Default false.
   */
  truncate?: boolean | number;
  /**
   * How lines wrap. `pre` keeps spaces and line breaks as written (a query, a log line) and still wraps at the edge;
   * `break` breaks long unbroken strings such as ids, hashes and URLs anywhere rather than letting them overflow.
   * `truncate` wins over it. Default: normal wrapping.
   */
  wrap?: "pre" | "break" | undefined;
  /** Tabular figures, so digits in a column line up. Default false. */
  numeric?: boolean;
  /** Id of the control this text labels. Used with `as="label"`. */
  htmlFor?: string | undefined;
  /** Machine-readable date or time. Used with `as="time"`. */
  dateTime?: string | undefined;
  /** Id of the element, for `aria-labelledby` and `aria-describedby`. */
  id?: string | undefined;
  /** Added to the root element, for layout. */
  className?: string | undefined;
  /** Layout only. Restyle through --cy-text-* tokens. */
  style?: CSSProperties | undefined;
  /** The text. */
  children?: ReactNode;
}

/** One piece of text in Cynosure's type scale: labels, captions, leads, helper lines and values. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Tag = "span",
    variant = "body",
    size,
    weight = Tag === "strong" ? "bold" : undefined,
    tone,
    align,
    truncate = false,
    wrap,
    numeric = false,
    htmlFor,
    dateTime,
    id,
    className,
    style,
    children,
  },
  ref,
) {
  const lines = typeof truncate === "number" && truncate > 0 ? Math.floor(truncate) : 0;
  return (
    <Tag
      // One component, nine elements: the ref is the element's own, typed as the common HTMLElement.
      ref={ref as never}
      id={id}
      className={className ? `cy-text ${className}` : "cy-text"}
      data-variant={variant === "body" ? undefined : variant}
      data-size={size}
      data-weight={weight}
      data-tone={tone}
      data-align={align}
      data-truncate={lines ? "lines" : truncate === true ? "" : undefined}
      data-wrap={wrap}
      data-numeric={numeric ? "" : undefined}
      {...(Tag === "label" && { htmlFor })}
      {...(Tag === "time" && { dateTime })}
      style={lines ? ({ "--_lines": lines, ...style } as CSSProperties) : style}
    >
      {children}
    </Tag>
  );
});
