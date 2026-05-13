import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import {
  scrollAreaCorner,
  scrollAreaRoot,
  scrollAreaScrollbar,
  scrollAreaThumb,
  scrollAreaViewport,
} from './ScrollArea.css.js';

export type ScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover';

/** Props for the {@link ScrollArea}. Inherits the rest of Radix `ScrollArea.Root`'s API. */
export interface ScrollAreaProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixScrollArea.Root>, 'type'> {
  /**
   * When the scrollbars are visible — see Radix `ScrollArea.Root`'s `type`.
   * `hover` shows scrollbars on pointer-over / scroll; `always` keeps them.
   * @default "hover"
   */
  type?: ScrollAreaType;
  /** Convenience for the viewport height (number is converted to `px`). */
  height?: number | string;
  /** Convenience for the viewport width (number is converted to `px`). */
  width?: number | string;
  /** Scrollable content rendered inside the Radix `Viewport`. */
  children?: ReactNode;
  /**
   * Which scrollbars to render — useful to suppress the orthogonal axis.
   * @default "both"
   */
  scrollbars?: 'vertical' | 'horizontal' | 'both';
}

const toCss = (value: number | string | undefined): string | undefined =>
  value === undefined ? undefined : typeof value === 'number' ? `${value.toString()}px` : value;

/**
 * ScrollArea is a custom-styled scroll container built on Radix Scroll Area.
 * Replaces native scrollbars with cynosure-styled thumbs that match across
 * platforms. Use when you need a constrained scrolling region inside a card,
 * panel, or popover. Native focus / keyboard scroll (arrow keys, Page Up/Down,
 * Home/End) still works because the viewport is the actual scroll element.
 */
export const ScrollArea = forwardRef<ElementRef<typeof RadixScrollArea.Root>, ScrollAreaProps>(
  function ScrollArea(
    { type = 'hover', height, width, scrollbars = 'both', className, style, children, ...rest },
    ref,
  ) {
    const mergedStyle = { width: toCss(width), height: toCss(height), ...style };
    return (
      <RadixScrollArea.Root
        ref={ref}
        type={type}
        className={cn(scrollAreaRoot, className)}
        style={mergedStyle}
        {...rest}
      >
        <RadixScrollArea.Viewport className={scrollAreaViewport}>
          {children}
        </RadixScrollArea.Viewport>
        {scrollbars !== 'horizontal' ? (
          <RadixScrollArea.Scrollbar orientation="vertical" className={scrollAreaScrollbar}>
            <RadixScrollArea.Thumb className={scrollAreaThumb} />
          </RadixScrollArea.Scrollbar>
        ) : null}
        {scrollbars !== 'vertical' ? (
          <RadixScrollArea.Scrollbar orientation="horizontal" className={scrollAreaScrollbar}>
            <RadixScrollArea.Thumb className={scrollAreaThumb} />
          </RadixScrollArea.Scrollbar>
        ) : null}
        <RadixScrollArea.Corner className={scrollAreaCorner} />
      </RadixScrollArea.Root>
    );
  },
);
