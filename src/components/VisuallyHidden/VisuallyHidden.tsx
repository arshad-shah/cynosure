import { type ElementType, forwardRef, type ReactNode } from "react";

export interface VisuallyHiddenProps {
  /** The text for screen readers. */
  children: ReactNode;
  /**
   * The element rendered. Use `span` inside a line of text, `div` or `p` for a block, and a heading level to give a
   * section a heading that only screen readers announce. Default "span".
   */
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /**
   * Show the content while something inside it has focus, for links and buttons that only keyboard users need. It is
   * hidden again when focus leaves. Default false.
   */
  focusable?: boolean;
  /** Set on the element, for `aria-labelledby`, `aria-describedby` and in-page links. */
  id?: string | undefined;
  /** Added to the element, for the layout of a focusable one while it is shown. */
  className?: string | undefined;
}

/**
 * Content for screen readers only: out of sight, still in the accessibility tree and read in place. With `focusable`,
 * it is shown while something inside it has keyboard focus.
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { children, as = "span", focusable = false, id, className },
  ref,
) {
  const Tag = as as ElementType;
  return (
    <Tag
      ref={ref}
      id={id}
      className={`cy-visually-hidden${className ? ` ${className}` : ""}`}
      data-focusable={focusable ? "" : undefined}
    >
      {children}
    </Tag>
  );
});
