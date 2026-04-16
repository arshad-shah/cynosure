import {
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { cn } from '../../../utils/cn.js';
import { Slot } from '../../Slot.js';
import {
  type AsChildProps,
  type LayoutProps,
  mergeStyles,
  resolveLayoutProps,
  splitLayoutProps,
} from '../shared/index.js';
import { containerBase, containerSize } from './Container.css.js';

export type ContainerSize = keyof typeof containerSize;

export interface ContainerOwnProps extends LayoutProps, AsChildProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** `sm`, `md`, `lg` (default), `xl`, `2xl`, `prose` (65ch), `full`. */
  size?: ContainerSize;
}

export type ContainerProps<E extends ElementType = 'div'> = ContainerOwnProps & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof ContainerOwnProps | 'as'>;

type AnyProps = ContainerOwnProps & { as?: ElementType; [key: string]: unknown };

const ContainerRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const { as, asChild, className, style, children, size = 'lg', ...rest } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as ContainerOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const mergedStyle = mergeStyles(layoutStyle, style);

  const Comp: ElementType = asChild ? Slot : (as ?? 'div');

  return (
    <Comp
      ref={ref}
      className={cn(containerBase, containerSize[size], className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {children}
    </Comp>
  );
};

/**
 * Max-width container, horizontally centred. Pass one of the predefined
 * `size`s (`sm`/`md`/`lg`/`xl`/`2xl`/`prose`/`full`) and optionally responsive
 * `paddingX` for gutter behaviour.
 */
export const Container = forwardRef<Element, AnyProps>(ContainerRender) as <
  E extends ElementType = 'div',
>(
  props: ContainerProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
