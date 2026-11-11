import type { CSSProperties, ReactNode } from "react";
import type { Size } from "../../tokens/schema.js";

export interface ProseTokens {
  /** Longest line length. */
  measure: string;
  /** Space between blocks (paragraphs, lists, headings). */
  flow: string;
  /** Link colour. */
  link: string;
  /** Background of inline code and code blocks. */
  codeBackground: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    prose: ProseTokens;
  }
}

export interface ProseProps {
  /** Body text size; headings scale from it. */
  size?: Size;
  /** Neutral element to render. Use `article` for a standalone piece of writing. */
  as?: "div" | "article" | "section";
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-prose-* tokens. */
  style?: CSSProperties;
  /** Rendered Markdown or other long-form HTML. Cynosure components inside keep their own styles. */
  children?: ReactNode;
}

/** Typography for long text you do not style element by element: rendered Markdown, docs, release notes, help. */
export function Prose({ size = "md", as: Tag = "div", className, style, children }: ProseProps) {
  return (
    <Tag className={className ? `cy-prose ${className}` : "cy-prose"} data-size={size} style={style}>
      {children}
    </Tag>
  );
}
