import {
  Children,
  type HTMLAttributes,
  type ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react';
import { cn } from '../../utils/cn.js';
import {
  timelineConnector,
  timelineContent,
  timelineDot,
  timelineItem,
  timelineRoot,
  timelineSeparator,
  timelineSize,
} from './Timeline.css.js';

export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineSize = 'sm' | 'md' | 'lg';
export type TimelineDotColorScheme =
  | 'accent'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type TimelineDotVariant = 'solid' | 'outline';

/** Props for the {@link Timeline} root `<ol>`. */
export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  /**
   * Lay items out vertically (top-to-bottom) or horizontally (left-to-right).
   * @default "vertical"
   */
  orientation?: TimelineOrientation;
  /**
   * Density preset for dot size, gap, and connector thickness.
   * @default "md"
   */
  size?: TimelineSize;
}

/**
 * Timeline renders a sequential list of events as an ordered list (`<ol>`).
 * Items are wired up automatically: the last child receives `data-last="true"`
 * so the trailing connector can be hidden in CSS. Each item composes a
 * {@link TimelineSeparator} (containing a {@link TimelineDot} and a
 * {@link TimelineConnector}) with a {@link TimelineContent} block.
 */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { orientation = 'vertical', size = 'md', className, children, ...rest },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement);
  const last = items.length - 1;
  const marked = items.map((child, idx) =>
    cloneElement(
      child as React.ReactElement<TimelineItemOwnProps>,
      {
        'data-last': idx === last ? 'true' : undefined,
      } as TimelineItemOwnProps,
    ),
  );
  return (
    <ol
      ref={ref}
      data-orientation={orientation}
      className={cn(timelineRoot, timelineSize[size], className)}
      {...rest}
    >
      {marked}
    </ol>
  );
});

interface TimelineItemOwnProps {
  'data-last'?: string;
}

/** Props for a single {@link TimelineItem} (`<li>`). `data-last` is set automatically by the parent. */
export interface TimelineItemProps extends HTMLAttributes<HTMLLIElement>, TimelineItemOwnProps {}
/** One event in a {@link Timeline}. Direct child must be the root `<ol>`. */
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  { className, ...rest },
  ref,
) {
  return <li ref={ref} className={cn(timelineItem, className)} {...rest} />;
});

/** Props for the {@link TimelineSeparator} that bundles the dot and connector. */
export interface TimelineSeparatorProps extends HTMLAttributes<HTMLDivElement> {}
/** Aside column inside a {@link TimelineItem} that holds the dot + connector. Marked `aria-hidden`. */
export const TimelineSeparator = forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  function TimelineSeparator({ className, ...rest }, ref) {
    return (
      <div ref={ref} aria-hidden="true" className={cn(timelineSeparator, className)} {...rest} />
    );
  },
);

/** Props for the {@link TimelineDot} marker on a single item. */
export interface TimelineDotProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Colour role for the dot.
   * @default "accent"
   */
  colorScheme?: TimelineDotColorScheme;
  /**
   * `solid` paints a filled circle; `outline` leaves the centre transparent.
   * @default "solid"
   */
  variant?: TimelineDotVariant;
  /** Optional icon centred inside the dot — overrides `children`. */
  icon?: ReactNode;
}

/** Coloured marker inside a {@link TimelineSeparator}. Pass `icon` (or `children`) for an inline glyph. */
export const TimelineDot = forwardRef<HTMLSpanElement, TimelineDotProps>(function TimelineDot(
  { colorScheme = 'accent', variant = 'solid', icon, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      data-color={colorScheme}
      data-variant={variant}
      className={cn(timelineDot, className)}
      {...rest}
    >
      {icon ?? children}
    </span>
  );
});

/** Props for the {@link TimelineConnector} line that links one dot to the next. */
export interface TimelineConnectorProps extends HTMLAttributes<HTMLSpanElement> {}
/** Line between two {@link TimelineDot}s; hidden by CSS on the final item. */
export const TimelineConnector = forwardRef<HTMLSpanElement, TimelineConnectorProps>(
  function TimelineConnector({ className, ...rest }, ref) {
    return <span ref={ref} className={cn(timelineConnector, className)} {...rest} />;
  },
);

/** Props for the {@link TimelineContent} block paired with each {@link TimelineSeparator}. */
export interface TimelineContentProps extends HTMLAttributes<HTMLDivElement> {}
/** Main content area for a {@link TimelineItem} — title, description, timestamp. */
export const TimelineContent = forwardRef<HTMLDivElement, TimelineContentProps>(
  function TimelineContent({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(timelineContent, className)} {...rest} />;
  },
);
