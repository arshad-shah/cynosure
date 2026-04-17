import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useClipboard } from '../../hooks/useClipboard.js';
import { cn } from '../../utils/cn.js';
import {
  codeBlockCopyButton,
  codeBlockHeader,
  codeBlockLine,
  codeBlockLineNumber,
  codeBlockPre,
  codeBlockRoot,
  codeBlockScroll,
} from './CodeBlock.css.js';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Raw source code. */
  children: string;
  /** Shiki language identifier. Default `text`. */
  language?: string;
  /** Prefix every line with its number. */
  showLineNumbers?: boolean;
  /** Show a copy-to-clipboard button in the header. */
  copyable?: boolean;
  /** 1-based line numbers to visually highlight. */
  highlightLines?: number[];
  /** Max scrollable height. Adds an internal scroll region above this. */
  maxHeight?: number | string;
  /** Pre-highlighted HTML (output of `shiki.codeToHtml`). Overrides the plain renderer. */
  html?: string;
  /** Shiki theme pair — passed to the lazy loader. */
  theme?: string | { light: string; dark: string };
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
 * Syntax-highlighted code block. By default renders a plain `<pre><code>` tree —
 * pass a pre-rendered `html` string (typically from `shiki.codeToHtml`) to get
 * highlighted output. Shiki is intentionally not pulled in at module load so
 * the base bundle stays lean; wire it up in userland or via the
 * `@lumen/react/code-block` entry point.
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

  // Apply per-line highlight data attributes after Shiki-rendered HTML paints.
  useEffect(() => {
    if (!html || !preRef.current) return;
    const lines = preRef.current.querySelectorAll('.line');
    const hl = new Set(highlightLines ?? []);
    lines.forEach((el, idx) => {
      if (hl.has(idx + 1)) el.setAttribute('data-highlighted', 'true');
      else el.removeAttribute('data-highlighted');
    });
  }, [html, highlightLines]);

  const mergedStyle: CSSProperties = {
    ...style,
    ...(maxHeight !== undefined
      ? {
          ['--lumen-code-max-height' as string]:
            typeof maxHeight === 'number' ? `${maxHeight.toString()}px` : maxHeight,
        }
      : {}),
  };

  // Swallow the `theme` prop — unused by the plain renderer but accepted so
  // callers that use `html=` stay API-compatible.
  void theme;

  const plainLines = html ? null : splitLines(children);
  const hl = new Set(highlightLines ?? []);

  return (
    <div ref={ref} className={cn(codeBlockRoot, className)} style={mergedStyle} {...rest}>
      {filename !== undefined || copyable || language !== 'text' ? (
        <div className={codeBlockHeader}>
          <span>{filename ?? language}</span>
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
        </div>
      ) : null}
      <div className={codeBlockScroll}>
        {html ? (
          <div
            ref={preRef as unknown as React.Ref<HTMLDivElement>}
            className={codeBlockPre}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: consumers pass Shiki-generated HTML — sanitisation is their contract
            dangerouslySetInnerHTML={{ __html: html }}
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
                    {'\n'}
                  </span>
                );
              })}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
});

/**
 * Lazy-loads Shiki and returns a function that renders source -> themed HTML.
 * Consumers call this once at module scope, pass the result into `<CodeBlock html={…}>`.
 *
 * ```tsx
 * import { createShikiRenderer } from '@lumen/react/code-block';
 * const highlight = await createShikiRenderer({ langs: ['tsx'], themes: ['github-dark'] });
 * const html = highlight('const x = 1', { lang: 'tsx', theme: 'github-dark' });
 * ```
 */
export async function createShikiRenderer(options: {
  langs: string[];
  themes: string[];
}): Promise<(code: string, opts: { lang: string; theme: string }) => string> {
  const shiki = (await import('shiki')) as {
    createHighlighter: (opts: { langs: string[]; themes: string[] }) => Promise<{
      codeToHtml: (code: string, opts: { lang: string; theme: string }) => string;
    }>;
  };
  const highlighter = await shiki.createHighlighter({
    langs: options.langs,
    themes: options.themes,
  });
  return (code, opts) => highlighter.codeToHtml(code, opts);
}

/** Render into a ref — fire-and-forget style helper, useful for SSR-after. */
export function useShikiRender(
  source: string,
  options: { lang: string; theme: string } & { enabled?: boolean },
): { html: string | null; loading: boolean; error: Error | null } {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options.enabled === false) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const render = await createShikiRenderer({
          langs: [options.lang],
          themes: [options.theme],
        });
        const out = render(source, { lang: options.lang, theme: options.theme });
        if (!cancelled) setHtml(out);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause : new Error(String(cause)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, options.lang, options.theme, options.enabled]);

  return { html, loading, error };
}
