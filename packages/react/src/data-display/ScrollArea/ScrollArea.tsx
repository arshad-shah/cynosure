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

export interface ScrollAreaProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixScrollArea.Root>, 'type'> {
  type?: ScrollAreaType;
  /** Convenience for the viewport height. */
  height?: number | string;
  /** Convenience for the viewport width. */
  width?: number | string;
  children?: ReactNode;
  /** Which scrollbars to render. Default both. */
  scrollbars?: 'vertical' | 'horizontal' | 'both';
}

const toCss = (value: number | string | undefined): string | undefined =>
  value === undefined ? undefined : typeof value === 'number' ? `${value.toString()}px` : value;

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
