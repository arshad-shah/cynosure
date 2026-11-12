import { type CSSProperties, createElement, type ReactNode } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";
import type { Size } from "../../tokens/schema.js";

export interface EmptyStateTokens {
  gap: string;
  padding: string;
  maxWidth: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    emptyState: EmptyStateTokens;
  }
}

export interface EmptyStateProps {
  /** A Facet icon shown above the title (decorative). */
  icon?: IconData | undefined;
  /** The heading: what is empty or missing. */
  title: ReactNode;
  /** A sentence under the title. */
  description?: ReactNode | undefined;
  /** Buttons for the next step ("Create a project", "Clear filters"). */
  actions?: ReactNode | undefined;
  /**
   * Heading level of the title, to fit the page outline (default 3). 1 when the empty state is the page itself (a
   * not-found page): the look stays the same.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** `sm` for panels and popups, `md` for page areas. */
  size?: Extract<Size, "sm" | "md">;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-empty-state-* tokens. */
  style?: CSSProperties;
}

/** What to show where content will be: no items yet, no search results, nothing selected. */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  headingLevel = 3,
  size = "md",
  className,
  style,
}: EmptyStateProps) {
  return (
    <div
      className={className ? `cy-empty-state ${className}` : "cy-empty-state"}
      data-size={size}
      style={style}
    >
      {icon && (
        <span className="cy-empty-state-icon cy-reset">
          <Icon icon={icon} size="lg" />
        </span>
      )}
      {createElement(`h${headingLevel}`, { className: "cy-empty-state-title cy-reset" }, title)}
      {description && <p className="cy-empty-state-description cy-reset">{description}</p>}
      {actions && <div className="cy-empty-state-actions cy-reset">{actions}</div>}
    </div>
  );
}
