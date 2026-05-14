import {
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  Fragment,
  type ReactElement,
  type ReactNode,
  createElement,
  forwardRef,
} from 'react';
import { Box } from '../../primitives/layout/Box/Box.js';
import type { AsChildProps, LayoutProps } from '../../primitives/layout/shared/index.js';
import { cn } from '../../utils/cn.js';
import {
  boldSolid,
  boldSubtle,
  chipSolid,
  chipSubtle,
  markBase,
  markerSolid,
  markerSubtle,
  underlineSolid,
  underlineSubtle,
} from './Mark.css.js';

export type MarkVariant = 'marker' | 'underline' | 'chip' | 'bold';
export type MarkColorScheme = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type MarkIntensity = 'subtle' | 'solid';
export type MarkAs = 'mark' | 'span';

/**
 * Props specific to `Mark`, layered on top of `LayoutProps` and `AsChildProps`.
 */
export interface MarkOwnProps extends LayoutProps, AsChildProps {
  /**
   * Visual treatment for the highlight.
   * @default "marker"
   */
  variant?: MarkVariant;
  /**
   * Token palette. Defaults to `warning` for the highlighter-pen feel.
   * @default "warning"
   */
  colorScheme?: MarkColorScheme;
  /**
   * `subtle` uses the soft surface token; `solid` uses the saturated token.
   * @default "subtle"
   */
  intensity?: MarkIntensity;
  /**
   * Semantic element. `mark` (default) carries the native highlight role;
   * use `span` when the surrounding context already conveys meaning and the
   * highlight is purely decorative.
   * @default "mark"
   */
  as?: MarkAs;
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Highlighted text content.
   */
  children?: ReactNode;
}

export type MarkProps = MarkOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof MarkOwnProps | 'color'>;

type AnyProps = MarkOwnProps & { [key: string]: unknown };

function variantClass(
  variant: MarkVariant,
  scheme: MarkColorScheme,
  intensity: MarkIntensity,
): string {
  if (variant === 'marker')
    return intensity === 'solid' ? markerSolid[scheme] : markerSubtle[scheme];
  if (variant === 'chip') return intensity === 'solid' ? chipSolid[scheme] : chipSubtle[scheme];
  if (variant === 'underline')
    return intensity === 'solid' ? underlineSolid[scheme] : underlineSubtle[scheme];
  return intensity === 'solid' ? boldSolid[scheme] : boldSubtle[scheme];
}

const MarkRender = (props: AnyProps, ref: ForwardedRef<HTMLElement>): ReactElement => {
  const {
    asChild,
    className,
    style,
    children,
    variant = 'marker',
    colorScheme = 'warning',
    intensity = 'subtle',
    as = 'mark',
    ...rest
  } = props;

  return (
    <Box
      ref={ref as never}
      as={as}
      asChild={asChild}
      className={cn(markBase, variantClass(variant, colorScheme, intensity), className)}
      style={style}
      {...rest}
    >
      {children}
    </Box>
  );
};

/**
 * Inline-flow text highlight. Wraps its children in a `<mark>` (or opt-in
 * `<span>`) styled with Cynosure tokens. Use this instead of `Badge`/`Code`
 * when you need a highlight that wraps with surrounding text without breaking
 * baseline alignment.
 *
 * Pair with `HighlightedText` for the common "highlight these ranges in this
 * string" case.
 */
export const Mark = forwardRef<HTMLElement, MarkProps>(MarkRender as never);

/* ── HighlightedText ──────────────────────────────────────────── */

/**
 * Half-open `[start, end)` range describing a slice of `text` to highlight.
 * `length` is accepted as a convenience alias for `end - start`.
 */
export interface HighlightRange {
  /** Inclusive start index, in code units of the source string. */
  start: number;
  /** Exclusive end index. Provide one of `end` or `length`. */
  end?: number;
  /** Range length. Provide one of `end` or `length`. */
  length?: number;
}

export interface HighlightedTextProps
  extends Omit<MarkOwnProps, 'children'>,
    Omit<React.HTMLAttributes<HTMLElement>, keyof MarkOwnProps | 'color' | 'children'> {
  /** Source string. */
  text: string;
  /** Ranges to wrap in a `Mark`. Order and overlap are normalised. */
  ranges: ReadonlyArray<HighlightRange>;
  /** Tag rendered around the whole string. Default is a fragment. */
  wrapper?: ElementType | null;
}

/**
 * Normalise + sort ranges, clamp to `[0, length]`, merge overlapping ones so
 * each segment is rendered at most once. Empty ranges (start === end) are
 * dropped — they would render an empty `<mark>`.
 */
function normaliseRanges(
  ranges: ReadonlyArray<HighlightRange>,
  textLength: number,
): Array<{ start: number; end: number }> {
  const normalised: Array<{ start: number; end: number }> = [];
  for (const r of ranges) {
    const start = Math.max(0, Math.min(textLength, r.start));
    // Compute end from the clamped start so callers passing a negative start
    // with a positive `length` still get a leading slice highlighted.
    const rawEnd = r.end ?? (r.length != null ? start + r.length : start);
    const end = Math.max(start, Math.min(textLength, rawEnd));
    if (end > start) normalised.push({ start, end });
  }
  normalised.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Array<{ start: number; end: number }> = [];
  for (const r of normalised) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push({ start: r.start, end: r.end });
    }
  }
  return merged;
}

/**
 * Highlights one or more ranges inside `text`. Avoids the manual segment
 * bookkeeping every consumer otherwise writes.
 *
 * ```tsx
 * <HighlightedText
 *   text="the quick brown fox"
 *   ranges={[{ start: 4, length: 5 }]}
 *   colorScheme="warning"
 * />
 * ```
 */
export function HighlightedText({
  text,
  ranges,
  wrapper = null,
  variant,
  colorScheme,
  intensity,
  as,
  className,
  style,
  ...markProps
}: HighlightedTextProps): ReactElement {
  const segments = normaliseRanges(ranges, text.length);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const seg of segments) {
    if (seg.start > cursor) {
      parts.push(<Fragment key={`t-${cursor}`}>{text.slice(cursor, seg.start)}</Fragment>);
    }
    parts.push(
      <Mark
        key={`m-${seg.start}`}
        variant={variant}
        colorScheme={colorScheme}
        intensity={intensity}
        as={as}
        className={className}
        style={style}
        {...markProps}
      >
        {text.slice(seg.start, seg.end)}
      </Mark>,
    );
    cursor = seg.end;
  }
  if (cursor < text.length) {
    parts.push(<Fragment key={`t-${cursor}`}>{text.slice(cursor)}</Fragment>);
  }

  if (wrapper == null) return <>{parts}</>;
  return createElement(wrapper, null, parts);
}
