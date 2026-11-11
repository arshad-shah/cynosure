import type { CSSProperties, ReactNode } from "react";
import type { Size } from "../../tokens/schema.js";

export interface DescriptionListTokens {
  /** Widest the term column gets when terms sit beside their details. */
  termWidth: string;
  /** Space between the term and detail columns. */
  columnGap: string;
  /** Space between rows. */
  rowGap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    descriptionList: DescriptionListTokens;
  }
}

export interface DescriptionItem {
  /** Defaults to the term when it is a string. */
  id?: string;
  term: ReactNode;
  /** One detail, or several for a term with more than one value. */
  detail: ReactNode | ReactNode[];
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /**
   * `inline`: terms beside their details. `stacked`: terms above. `auto` (default): inline when the list is at least
   * 28rem wide, stacked when narrower (it follows the list's own width, not the window's).
   */
  layout?: "auto" | "inline" | "stacked";
  /** Lines between rows. */
  divided?: boolean;
  size?: Size;
  className?: string;
  /** Layout only. Restyle through --cy-description-list-* tokens. */
  style?: CSSProperties;
}

/** Term and detail pairs: settings summaries, metadata, the facts about a record. */
export function DescriptionList({
  items,
  layout = "auto",
  divided = false,
  size = "md",
  className,
  style,
}: DescriptionListProps) {
  return (
    <div
      className={className ? `cy-description-list ${className}` : "cy-description-list"}
      data-layout={layout}
      data-size={size}
      data-divided={divided ? "" : undefined}
      style={style}
    >
      <dl className="cy-description-list-list cy-reset">
        {items.map((item, i) => (
          <div
            key={item.id ?? (typeof item.term === "string" ? item.term : i)}
            className="cy-description-list-row cy-reset"
          >
            <dt className="cy-description-list-term cy-reset">{item.term}</dt>
            {(Array.isArray(item.detail) ? item.detail : [item.detail]).map((detail, j) => (
              <dd key={j} className="cy-description-list-detail cy-reset">
                {detail}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </div>
  );
}
