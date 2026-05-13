// packages/react/src/feedback/Indicator/Indicator.tsx
import {
  type CSSProperties,
  Children,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn.js';
import { Badge } from '../Badge/Badge.js';
import type { BadgeColorScheme, BadgeSize, BadgeVariant } from '../Badge/Badge.js';
import {
  indicatorBadgeWrapper,
  indicatorHidden,
  indicatorPlacement,
  indicatorRoot,
} from './Indicator.css.js';

export type IndicatorPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

/**
 * Props for the {@link Indicator} component.
 */
export interface IndicatorProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'content'> {
  /** Content rendered inside the badge. Omit for dot mode. */
  content?: ReactNode;
  /**
   * Render as a bare coloured dot rather than a content badge.
   * @default false
   */
  dot?: boolean;
  /**
   * Corner the badge hugs. One of `top-start`, `top-end`, `bottom-start`,
   * `bottom-end`.
   * @default "top-end"
   */
  placement?: IndicatorPlacement;
  /**
   * Inset offset in pixels. Positive values push the badge further outside
   * the child.
   * @default 0
   */
  offset?: number;
  /** Hide the badge entirely while preserving layout. */
  invisible?: boolean;
  /** Predicate variant of `invisible`, evaluated against `content`. */
  hideOn?: (content: ReactNode) => boolean;
  /**
   * Palette forwarded to the inner badge. One of `neutral`, `accent`,
   * `success`, `warning`, `danger`, `info`.
   * @default "neutral"
   */
  colorScheme?: BadgeColorScheme;
  /**
   * Visual style forwarded to the inner badge. One of `soft`, `solid`,
   * `outline`, `ghost`.
   * @default "solid"
   */
  variant?: BadgeVariant;
  /**
   * Pixel scale forwarded to the inner badge.
   * @default "xs"
   */
  size?: BadgeSize;
  /** Icon rendered inside the badge alongside `content`. */
  icon?: ReactNode;
  /** The element the indicator decorates. Exactly one React element. */
  children: ReactElement;
  /**
   * Override screen-reader label. When omitted and `content` is a string or
   * number, the content is announced; in pure dot mode the indicator is
   * marked decorative.
   */
  'aria-label'?: string;
}

/**
 * Anchors a badge or dot to one corner of a single child element. Use
 * Indicator to surface counts (unread messages, notifications) or presence
 * dots without changing the underlying element's layout. The wrapper is
 * announced as `role="status"` with a derived label so updates remain
 * accessible; pure decorative dots are hidden from assistive tech.
 */
export const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(function Indicator(
  {
    content,
    dot = false,
    placement = 'top-end',
    offset = 0,
    invisible,
    hideOn,
    colorScheme = 'neutral',
    variant = 'solid',
    size = 'xs',
    icon,
    children,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  // Enforce single-child contract — throws with a React-native error.
  const onlyChild = Children.only(children);

  const isHidden = Boolean(invisible) || (hideOn ? hideOn(content) : false);
  const isDecorative = dot && !ariaLabel && (content === undefined || content === null);

  const derivedLabel =
    ariaLabel ??
    (typeof content === 'string' || typeof content === 'number' ? String(content) : undefined);

  const wrapperStyle: CSSProperties = {
    ['--indicator-offset' as string]: `${offset}px`,
    ...(isHidden ? { visibility: 'hidden' as const } : null),
  };

  const badgeWrapperProps = isDecorative
    ? { 'aria-hidden': true as const, 'data-testid': 'indicator-badge-wrapper' }
    : {
        role: 'status' as const,
        'aria-label': derivedLabel,
        'data-testid': 'indicator-badge-wrapper',
      };

  return (
    <span ref={ref} className={cn(indicatorRoot, className)} style={style} {...rest}>
      {onlyChild}
      <span
        data-placement={placement}
        className={cn(
          indicatorBadgeWrapper,
          indicatorPlacement[placement],
          isHidden && indicatorHidden,
        )}
        style={wrapperStyle}
        {...badgeWrapperProps}
      >
        <Badge
          dot={dot}
          colorScheme={colorScheme}
          variant={variant}
          size={size}
          icon={icon}
          shape="pill"
        >
          {dot ? undefined : content}
        </Badge>
      </span>
    </span>
  );
});
