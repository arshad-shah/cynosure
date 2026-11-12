import { type AriaRole, type CSSProperties, forwardRef, type ReactNode } from "react";
import { Container, type ContainerProps } from "../Container/Container.js";
import { type Space, space } from "../Stack/space.js";

export interface SectionTokens {
  /** Space above and below the content when the `paddingBlock` prop is not set. */
  paddingBlock: string;
  /** Background of `variant="surface"`. */
  surface: string;
  /** Background of `variant="soft"`. */
  soft: string;
  /** Background of `variant="accent"`. */
  accent: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    section: SectionTokens;
  }
}

export interface SectionProps {
  /**
   * The band's background: `plain` (none, the page shows through), `surface`, `soft` (a quiet tint) or `accent` (a
   * soft tint of the accent colour). Text colours stay readable on each. Default "plain".
   */
  variant?: "plain" | "surface" | "soft" | "accent";
  /** Space token for the padding above and below the content. Default: the `--cy-section-padding-block` token. */
  paddingBlock?: Space | undefined;
  /** Put the content in a centred Container (the page column). `false` lets it fill the band. Default true. */
  contained?: boolean;
  /** Widest the inner Container gets (its `size`). Ignored when `contained` is false. Default "lg". */
  size?: ContainerProps["size"];
  /**
   * The element rendered. A `section` is a region landmark only when it has a name (`aria-labelledby` or
   * `aria-label`). Default "section".
   */
  as?: "section" | "div" | "header" | "footer" | "aside" | "article";
  /** Set on the root element: the target of in-page links such as `#pricing`. */
  id?: string | undefined;
  /** Names the section, usually the id of its heading. */
  "aria-labelledby"?: string | undefined;
  /** Names the section when it has no visible heading. */
  "aria-label"?: string | undefined;
  /** An ARIA role for the root, when the element's own role is not the right one. */
  role?: AriaRole | undefined;
  /** Added to the root element, for layout. */
  className?: string | undefined;
  /** Layout only. Restyle through --cy-section-* tokens. */
  style?: CSSProperties;
  /** The section's content. */
  children?: ReactNode;
  /** Set on the root element, for tests. */
  "data-testid"?: string;
}

/**
 * A full-width band of a page: a background, space above and below, and the content in the page column. Stack
 * Sections to build a landing or documentation page.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    variant = "plain",
    paddingBlock,
    contained = true,
    size = "lg",
    as = "section",
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Tag = as;
  const vars = paddingBlock ? { "--_pad-block": space(paddingBlock) } : {};
  return (
    <Tag
      // One component, several elements: the ref is the element's own, typed as the common HTMLElement.
      ref={ref as never}
      {...rest}
      className={`cy-section${className ? ` ${className}` : ""}`}
      data-variant={variant}
      style={{ ...vars, ...style } as CSSProperties}
    >
      {contained ? <Container size={size}>{children}</Container> : children}
    </Tag>
  );
});
