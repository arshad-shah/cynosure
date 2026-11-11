import { type CSSProperties, type ReactNode, useId } from "react";
import type { Size } from "../../tokens/schema.js";
import { CopyButton, type CopyButtonLabels } from "../CopyButton/CopyButton.js";

export interface CodeBlockTokens {
  /** Background of the code. */
  background: string;
  /** Corner radius of the block. */
  radius: string;
  /** Tallest the code gets before it scrolls. */
  maxHeight: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    codeBlock: CodeBlockTokens;
  }
}

export interface CodeBlockLabels extends CopyButtonLabels {
  /** Name of the scrollable code region when there is no `title` or `language`. Default: "Code". */
  region: string;
  /** Read after the code when lines are marked. Default: "Line 3 highlighted" / "Lines 3, 4 highlighted". */
  active: (lines: readonly number[]) => string;
}

const defaultActive = (lines: readonly number[]) =>
  `${lines.length === 1 ? "Line" : "Lines"} ${lines.join(", ")} highlighted`;

export interface CodeBlockProps {
  /** The code to show and copy. One final new line is not shown as an empty last line. */
  code: string;
  /** Shown in the header (when there is no `title`) and passed to `highlight`. */
  language?: string | undefined;
  /** A file name or caption for the header, e.g. "vite.config.ts". */
  title?: ReactNode;
  /**
   * Your highlighter, e.g. `(code, lang) => <span dangerouslySetInnerHTML={{ __html: shiki(code, lang) }} />`. Cynosure
   * bundles none. Without it the code is plain text.
   */
  highlight?: ((code: string, language?: string) => ReactNode) | undefined;
  /** Show line numbers beside the code. Left out when `wrap` is on. */
  lineNumbers?: boolean;
  /** Lines to mark (1-based), such as the line a debugger is on. Marked behind the text and read out. */
  activeLines?: readonly number[] | undefined;
  /** Wrap long lines instead of scrolling sideways (line numbers are then left out, as they would not line up). */
  wrap?: boolean;
  /** Show the copy button. Default true. */
  copyable?: boolean;
  /** Passed to the copy button (extensions can copy through their own channel). */
  copy?: ((text: string) => Promise<void> | void) | undefined;
  /** Text size of the code. Default "md". */
  size?: Size;
  /** Replace the built-in English text: the copy button, the code region's name and the marked lines. */
  labels?: Partial<CodeBlockLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-code-block-* tokens. */
  style?: CSSProperties;
}

/**
 * Code to read and copy: a header with the file name or language and a copy button, then the code with optional line
 * numbers. Bring your own highlighter through `highlight`.
 */
export function CodeBlock({
  code,
  language,
  title,
  highlight,
  lineNumbers = false,
  activeLines,
  wrap = false,
  copyable = true,
  copy,
  size = "md",
  labels,
  className,
  style,
}: CodeBlockProps) {
  const id = useId();
  // One final new line is a file ending, not an empty last line.
  const shown = code.replace(/\n$/, "");
  const lines = shown.split("\n");
  const name = typeof title === "string" ? title : (language ?? labels?.region ?? "Code");
  const heading = title ?? language;
  const numbered = lineNumbers && !wrap;
  const marked = !wrap && activeLines?.length ? activeLines.filter((n) => n >= 1 && n <= lines.length) : [];
  const body = (
    <code className="cy-code-block-code cy-reset" data-language={language}>
      {highlight ? highlight(shown, language) : shown}
    </code>
  );
  return (
    <figure
      className={className ? `cy-code-block ${className}` : "cy-code-block"}
      data-size={size}
      data-wrap={wrap ? "" : undefined}
      aria-labelledby={heading ? `${id}-title` : undefined}
      aria-label={heading ? undefined : name}
      style={style}
    >
      {(heading || copyable) && (
        <div className="cy-code-block-header cy-reset">
          <span className="cy-code-block-title cy-reset" id={`${id}-title`}>
            {heading}
          </span>
          {copyable && (
            <CopyButton
              value={code}
              size="sm"
              variant="ghost"
              tooltipPlacement="start"
              {...(copy ? { copy } : {})}
              {...(labels ? { labels } : {})}
            />
          )}
        </div>
      )}
      <div className="cy-code-block-body cy-reset">
        {numbered && (
          <span className="cy-code-block-gutter cy-reset" aria-hidden="true">
            {lines.map((_, i) => (
              <span key={i} className="cy-reset" data-active={marked.includes(i + 1) ? "" : undefined}>
                {i + 1}
              </span>
            ))}
          </span>
        )}
        {wrap ? (
          <pre className="cy-code-block-pre cy-reset">{body}</pre>
        ) : (
          // A scrolling region must be reachable by keyboard: it is focusable and named.
          // biome-ignore lint/a11y/noNoninteractiveTabindex lint/a11y/useSemanticElements: the scrolling pre itself is the focusable, named region
          <pre className="cy-code-block-pre cy-reset" tabIndex={0} role="region" aria-label={name}>
            {marked.map((n) => (
              <span
                key={n}
                className="cy-code-block-mark cy-reset"
                style={{ "--_line": n - 1 } as CSSProperties}
                aria-hidden="true"
              />
            ))}
            {body}
          </pre>
        )}
      </div>
      {marked.length > 0 && (
        <span className="cy-visually-hidden">{(labels?.active ?? defaultActive)(marked)}</span>
      )}
    </figure>
  );
}
