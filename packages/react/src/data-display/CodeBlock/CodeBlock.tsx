import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
} from 'react';
import { useClipboard } from '../../hooks/useClipboard.js';
import { Box } from '../../primitives/layout/Box/Box.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { cn } from '../../utils/cn.js';
import {
  codeBlockCopyButton,
  codeBlockHeader,
  codeBlockLabel,
  codeBlockLine,
  codeBlockLineNumber,
  codeBlockPre,
  codeBlockRoot,
  codeBlockScroll,
} from './CodeBlock.css.js';
import { type CodeTheme, useCodeHighlight } from './highlight.js';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Raw source code. */
  children: string;
  /** Shiki language identifier. Default `text` (no highlighting). */
  language?: string;
  /** Prefix every line with its number. */
  showLineNumbers?: boolean;
  /** Show a copy-to-clipboard button in the header. */
  copyable?: boolean;
  /** 1-based line numbers to visually highlight. */
  highlightLines?: number[];
  /** Max scrollable height. Adds an internal scroll region above this. */
  maxHeight?: number | string;
  /** Pre-rendered HTML (from `highlightCode` or Shiki's `codeToHtml`). Bypasses the auto-highlighter. */
  html?: string;
  /**
   * Shiki theme. A single string forces one theme; a `{ light, dark }` pair
   * emits dual-theme CSS variables that follow the Cynosure `data-theme`
   * attribute with a `prefers-color-scheme` fallback.
   */
  theme?: CodeTheme;
  /** Override the filename shown in the header. */
  filename?: ReactNode;
}

const CopyIcon = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const CheckIcon = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m5 12 4 4L19 6"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function splitLines(source: string): string[] {
  const trimmed = source.endsWith('\n') ? source.slice(0, -1) : source;
  return trimmed.split('\n');
}

/**
 * Syntax-highlighted code block built on Cynosure layout primitives. When
 * `language` is set (and `html` isn't) Shiki is lazy-loaded via the
 * module-level singleton and the source is highlighted in dual-theme mode —
 * the output follows the active `ThemeProvider` theme automatically.
 *
 * For fine control (pre-rendered HTML, custom highlighters) call
 * `highlightCode` / `useCodeHighlight` directly and pass the result as `html`.
 */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  {
    children,
    language = 'text',
    showLineNumbers = false,
    copyable = false,
    highlightLines,
    maxHeight,
    html,
    theme,
    filename,
    className,
    style,
    ...rest
  },
  ref,
) {
  const { copy, hasCopied } = useClipboard();
  const preRef = useRef<HTMLPreElement | null>(null);

  const shouldAutoHighlight = !html && language !== 'text';
  const { html: autoHtml } = useCodeHighlight(children, language, {
    theme,
    enabled: shouldAutoHighlight,
  });
  const effectiveHtml = html ?? autoHtml;

  // Apply per-line highlight data attributes after Shiki-rendered HTML paints.
  useEffect(() => {
    if (!effectiveHtml || !preRef.current) return;
    const lines = preRef.current.querySelectorAll('.line');
    const hl = new Set(highlightLines ?? []);
    lines.forEach((el, idx) => {
      if (hl.has(idx + 1)) el.setAttribute('data-highlighted', 'true');
      else el.removeAttribute('data-highlighted');
    });
  }, [effectiveHtml, highlightLines]);

  const mergedStyle: CSSProperties = {
    ...style,
    ...(maxHeight !== undefined
      ? {
          ['--cynosure-code-max-height' as string]:
            typeof maxHeight === 'number' ? `${maxHeight.toString()}px` : maxHeight,
        }
      : {}),
  };

  const plainLines = effectiveHtml ? null : splitLines(children);
  const hl = new Set(highlightLines ?? []);
  const hasHeader = filename !== undefined || copyable || language !== 'text';

  return (
    <Box
      ref={ref as React.Ref<HTMLDivElement>}
      position="relative"
      background="background.surface"
      borderColor="border.subtle"
      borderWidth="1"
      borderStyle="solid"
      borderRadius="md"
      overflow="hidden"
      className={cn(codeBlockRoot, className)}
      style={mergedStyle}
      {...rest}
    >
      {hasHeader ? (
        <Inline
          justify="between"
          align="center"
          paddingX="3"
          paddingY="1.5"
          className={codeBlockHeader}
        >
          <span className={codeBlockLabel}>{filename ?? language}</span>
          {copyable ? (
            <button
              type="button"
              className={codeBlockCopyButton}
              aria-label={hasCopied ? 'Copied' : 'Copy code'}
              onClick={() => {
                void copy(children);
              }}
            >
              {hasCopied ? <CheckIcon /> : <CopyIcon />}
              <span>{hasCopied ? 'Copied' : 'Copy'}</span>
            </button>
          ) : null}
        </Inline>
      ) : null}
      <Box className={codeBlockScroll}>
        {effectiveHtml ? (
          <div
            ref={preRef as unknown as React.Ref<HTMLDivElement>}
            className={codeBlockPre}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is safe-by-construction
            dangerouslySetInnerHTML={{ __html: effectiveHtml }}
          />
        ) : (
          <pre className={codeBlockPre} data-language={language}>
            <code>
              {plainLines?.map((line, idx) => {
                const isHl = hl.has(idx + 1);
                return (
                  <span
                    key={`line-${idx.toString()}`}
                    data-line-number={idx + 1}
                    data-highlighted={isHl ? 'true' : undefined}
                    className={codeBlockLine}
                  >
                    {showLineNumbers ? (
                      <span className={codeBlockLineNumber}>{idx + 1}</span>
                    ) : null}
                    {line || ' '}
                  </span>
                );
              })}
            </code>
          </pre>
        )}
      </Box>
    </Box>
  );
});
