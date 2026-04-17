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

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  orientation?: TimelineOrientation;
  size?: TimelineSize;
}

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

export interface TimelineItemProps extends HTMLAttributes<HTMLLIElement>, TimelineItemOwnProps {}
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  { className, ...rest },
  ref,
) {
  return <li ref={ref} className={cn(timelineItem, className)} {...rest} />;
});

export interface TimelineSeparatorProps extends HTMLAttributes<HTMLDivElement> {}
export const TimelineSeparator = forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  function TimelineSeparator({ className, ...rest }, ref) {
    return (
      <div ref={ref} aria-hidden="true" className={cn(timelineSeparator, className)} {...rest} />
    );
  },
);

export interface TimelineDotProps extends HTMLAttributes<HTMLSpanElement> {
  colorScheme?: TimelineDotColorScheme;
  variant?: TimelineDotVariant;
  icon?: ReactNode;
}

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

export interface TimelineConnectorProps extends HTMLAttributes<HTMLSpanElement> {}
export const TimelineConnector = forwardRef<HTMLSpanElement, TimelineConnectorProps>(
  function TimelineConnector({ className, ...rest }, ref) {
    return <span ref={ref} className={cn(timelineConnector, className)} {...rest} />;
  },
);

export interface TimelineContentProps extends HTMLAttributes<HTMLDivElement> {}
export const TimelineContent = forwardRef<HTMLDivElement, TimelineContentProps>(
  function TimelineContent({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(timelineContent, className)} {...rest} />;
  },
);
