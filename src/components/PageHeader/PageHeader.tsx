import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { Heading } from "../Heading/Heading.js";
import { Text } from "../Text/Text.js";

export interface PageHeaderTokens {
  /** Space between the breadcrumbs, the title block, the actions and the content below them. */
  gap: string;
  /** Space between the eyebrow, the title, the description and the meta row. */
  textGap: string;
  /** Space between two actions and between items of the meta row. */
  actionsGap: string;
  /** Longest line of the description. */
  descriptionMaxWidth: string;
  /** Colour of the bottom border drawn by `divider`. */
  dividerColor: string;
  /** Space between the header's content and the bottom border drawn by `divider`. */
  dividerSpace: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    pageHeader: PageHeaderTokens;
  }
}

export interface PageHeaderProps {
  /** What the page or section is. Rendered as the header's one heading. */
  title: ReactNode;
  /** Heading level of the title, to fit the page outline. Default 1. */
  headingLevel?: 1 | 2 | 3;
  /**
   * Size of the title. "md" is the usual size of the heading level (level 1 "2xl", level 2 "xl", level 3 "lg" in
   * Heading's sizes); "lg" is the hero "display" size for a landing page. Default "md".
   */
  size?: "md" | "lg";
  /** A short label above the title that says where the page belongs. It comes before the title in reading order. */
  eyebrow?: ReactNode | undefined;
  /** One or two sentences under the title, as a lead paragraph. Pass inline content only. */
  description?: ReactNode | undefined;
  /** The trail to this page, shown above the eyebrow and the title. Pass a `Breadcrumbs`. */
  breadcrumbs?: ReactNode | undefined;
  /**
   * The page's buttons. They sit at the inline end, level with the top of the title block, and move below the text
   * when the header itself is narrower than 36rem or when `align` is "center".
   */
  actions?: ReactNode | undefined;
  /** A row under the description for badges, dates and authors. It wraps. */
  meta?: ReactNode | undefined;
  /** Anything below the rest of the header, at full width: tabs, a search field. */
  children?: ReactNode;
  /** "start" for pages; "center" centres the text and puts the actions below it, for landing pages. Default "start". */
  align?: "start" | "center";
  /** Draws a bottom border with space above it, to separate the header from the page. Default false. */
  divider?: boolean;
  /**
   * The element rendered. A `header` inside `main` is not a banner landmark, so no choice adds a landmark.
   * Default "header".
   */
  as?: "header" | "div" | "section";
  /** Added to the root element, for layout. */
  className?: string | undefined;
  /** Layout only. Restyle through --cy-page-header-* tokens. */
  style?: CSSProperties | undefined;
}

/** The top of a page or a major section: where you are, what this is, a sentence about it and the page's actions. */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  {
    title,
    headingLevel = 1,
    size = "md",
    eyebrow,
    description,
    breadcrumbs,
    actions,
    meta,
    children,
    align = "start",
    divider = false,
    as: Tag = "header",
    className,
    style,
  },
  ref,
) {
  return (
    <Tag
      // One component, three elements: the ref is the element's own, typed as the common HTMLElement.
      ref={ref as never}
      className={className ? `cy-page-header ${className}` : "cy-page-header"}
      data-size={size}
      data-align={align}
      data-divider={divider ? "" : undefined}
      style={style}
    >
      {breadcrumbs && <div className="cy-page-header-breadcrumbs cy-reset">{breadcrumbs}</div>}
      <div className="cy-page-header-main cy-reset">
        <div className="cy-page-header-text cy-reset">
          {eyebrow && (
            <Text as="p" variant="eyebrow" className="cy-page-header-eyebrow">
              {eyebrow}
            </Text>
          )}
          <Heading
            level={headingLevel}
            {...(size === "lg" ? { size: "display" as const } : {})}
            className="cy-page-header-title"
          >
            {title}
          </Heading>
          {description && (
            <Text as="p" variant="lead" className="cy-page-header-description">
              {description}
            </Text>
          )}
          {meta && <div className="cy-page-header-meta">{meta}</div>}
        </div>
        {actions && <div className="cy-page-header-actions cy-reset">{actions}</div>}
      </div>
      {children && <div className="cy-page-header-body cy-reset">{children}</div>}
    </Tag>
  );
});
