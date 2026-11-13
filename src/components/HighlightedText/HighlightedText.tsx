import { type CSSProperties, memo, type ReactNode } from "react";
import { textMatchRanges } from "../../foundations/text-match.js";

export interface HighlightedTextTokens {
  radius: string;
  weight: string;
  ink: string;
  highlight: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    highlightedText: HighlightedTextTokens;
  }
}

export interface HighlightedTextProps {
  /** The text to show. */
  text: string;
  /**
   * Indices of the matched characters in `text`, as fuzzy matchers return them (string indices: UTF-16 code units).
   * Order does not matter; indices outside the text are ignored. Wins over `query`.
   */
  positions?: readonly number[] | undefined;
  /**
   * Text to find, ignoring case: every occurrence is marked. Several terms (the words of a search) mark each one.
   * Empty terms mark nothing.
   */
  query?: string | readonly string[] | undefined;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-highlighted-text-* tokens. */
  style?: CSSProperties;
}

/**
 * Which characters of `text` are matched: from `positions`, else from every occurrence of each `query` term, found as
 * `textMatches` finds them (so a filter built on it keeps exactly the rows that show a mark).
 */
export function matchedCharacters(
  text: string,
  positions: readonly number[] | undefined,
  query: string | readonly string[] | undefined,
): boolean[] {
  const hit = new Array<boolean>(text.length).fill(false);
  if (positions) {
    for (const p of positions) if (p >= 0 && p < text.length) hit[p] = true;
    return hit;
  }
  for (const term of typeof query === "string" ? [query] : (query ?? []))
    for (const [start, end] of textMatchRanges(text, term)) hit.fill(true, start, end);
  return hit;
}

/**
 * Text with the parts that matched a search marked: a fuzzy matcher's `positions`, or every occurrence of a `query`.
 * The text is in the page once, so a row named by its content (an option, a tree item) is named by the whole text.
 */
export const HighlightedText = memo(function HighlightedText({
  text,
  positions,
  query,
  className,
  style,
}: HighlightedTextProps) {
  const hit = matchedCharacters(text, positions, query);
  // Runs of matched and unmatched characters, in order.
  const runs: ReactNode[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i < text.length && hit[i] === hit[start]) continue;
    const part = text.slice(start, i);
    runs.push(
      hit[start] ? (
        <mark key={start} className="cy-highlighted-text-mark cy-reset">
          {part}
        </mark>
      ) : (
        part
      ),
    );
    start = i;
  }
  return (
    <span className={className ? `cy-highlighted-text ${className}` : "cy-highlighted-text"} style={style}>
      {runs}
    </span>
  );
});
