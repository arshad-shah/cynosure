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
import { kbdBase, kbdSize } from './Kbd.css.js';

export type KbdSize = 'sm' | 'md' | 'lg';

export interface KbdOwnProps extends LayoutProps, AsChildProps {
  size?: KbdSize;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type KbdProps = KbdOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof KbdOwnProps | 'color'>;

type AnyProps = KbdOwnProps & { [key: string]: unknown };

const KbdRender = (props: AnyProps, ref: ForwardedRef<HTMLElement>): ReactElement => {
  const { asChild, className, style, children, size = 'md', ...rest } = props;

  return (
    <Box
      ref={ref as never}
      as="kbd"
      asChild={asChild}
      className={cn(kbdBase, kbdSize[size], className)}
      style={style}
      {...rest}
    >
      {children}
    </Box>
  );
};

/**
 * Renders a `<kbd>` styled as a faux keycap. Sizes `sm | md | lg` scale
 * padding + font-size together so keycaps sit nicely alongside body text at
 * the corresponding size.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(KbdRender as never);
