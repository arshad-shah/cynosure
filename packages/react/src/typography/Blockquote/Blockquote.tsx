import {
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { Box } from '../../primitives/layout/Box/Box.js';
import type { AsChildProps, LayoutProps } from '../../primitives/layout/shared/index.js';
import { cn } from '../../utils/cn.js';
import { blockquoteAttribution, blockquoteBase, blockquoteVariant } from './Blockquote.css.js';

export type BlockquoteVariant = 'default' | 'callout';

/**
 * Props specific to `Blockquote`, layered on `LayoutProps` and `AsChildProps`.
 */
export interface BlockquoteOwnProps extends LayoutProps, AsChildProps {
  /**
   * Source attribution. Rendered inside a `<cite>` below the quote body.
   */
  attribution?: ReactNode;
  /**
   * Visual style — `default` is a quiet rule-flanked quote; `callout` picks
   * up the accent palette for pull-quote emphasis.
   * @default "default"
   */
  variant?: BlockquoteVariant;
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Quote body.
   */
  children?: ReactNode;
}

export type BlockquoteProps = BlockquoteOwnProps &
  Omit<React.HTMLAttributes<HTMLQuoteElement>, keyof BlockquoteOwnProps | 'color'>;

type AnyProps = BlockquoteOwnProps & { [key: string]: unknown };

const BlockquoteRender = (props: AnyProps, ref: ForwardedRef<HTMLQuoteElement>): ReactElement => {
  const { asChild, className, style, children, attribution, variant = 'default', ...rest } = props;

  return (
    <Box
      ref={ref as never}
      as="blockquote"
      asChild={asChild}
      className={cn(blockquoteBase, blockquoteVariant[variant], className)}
      style={style}
      {...rest}
    >
      {children}
      {attribution !== undefined ? (
        <Box as="cite" className={blockquoteAttribution}>
          {attribution}
        </Box>
      ) : null}
    </Box>
  );
};

/**
 * Semantic `<blockquote>` with optional `<cite>` attribution rendered via Box.
 * `callout` variant picks up the accent palette for pull-quote-style emphasis.
 */
export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(BlockquoteRender as never);
