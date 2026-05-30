import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { scrollAreaRoot, scrollAreaViewport } from './ScrollArea.css.js';

export type ScrollAreaType = 'auto' | 'always' | 'hover';

/** Props for the {@link ScrollArea}. */
export interface ScrollAreaProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * When scrollbars are visible.
   * - `auto` (default): browser default — scrollbar appears when content overflows.
   * - `always`: reserved gutter even when no overflow.
   * - `hover`: scrollbars become visible on pointer over via CSS.
   * @default "auto"
   */
  type?: ScrollAreaType;
  /** Convenience for the viewport height (number is converted to `px`). */
  height?: number | string;
  /** Convenience for the viewport width (number is converted to `px`). */
  width?: number | string;
  /** Scrollable content. */
  children?: ReactNode;
  /**
   * Which scrollbars to render — useful to suppress the orthogonal axis.
   * @default "both"
   */
  scrollbars?: 'vertical' | 'horizontal' | 'both';
}

const toCss = (value: number | string | undefined): string | undefined =>
  value === undefined ? undefined : typeof value === 'number' ? `${value.toString()}px` : value;

const overflowFor = (
  scrollbars: 'vertical' | 'horizontal' | 'both',
  type: ScrollAreaType,
): CSSProperties => {
  // `auto`/`hover` use overflow:auto so scrollbars only render when content
  // overflows; `always` uses overflow:scroll to reserve gutter unconditionally.
  const value = type === 'always' ? 'scroll' : 'auto';
  const hidden = 'hidden';
  if (scrollbars === 'both') return { overflow: value };
  if (scrollbars === 'vertical') return { overflowY: value, overflowX: hidden };
  return { overflowY: hidden, overflowX: value };
};

/**
 * Custom-styled scroll container. Uses native scrolling (so focus, keyboard
 * navigation, and screen-reader scroll-into-view all work for free) with
 * token-driven scrollbar styling via the `scrollbar-color` /
 * `scrollbar-width` CSS properties. Older browsers fall back to the OS
 * default scrollbar — visually different, behaviour identical.
 *
 * `type="hover"` fades the scrollbar in on hover via CSS (`scrollbar-color`
 * toggles between transparent and the token colour).
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { type = 'auto', height, width, scrollbars = 'both', className, style, children, ...rest },
  ref,
) {
  const merged: CSSProperties = {
    width: toCss(width),
    height: toCss(height),
    ...overflowFor(scrollbars, type),
    ...style,
  };
  return (
    <div
      ref={ref}
      data-scroll-type={type}
      data-scrollbars={scrollbars}
      className={cn(scrollAreaRoot, scrollAreaViewport, className)}
      style={merged}
      {...rest}
    >
      {children}
    </div>
  );
});
