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
  type Responsive,
  mergeStyles,
  resolveLayoutProps,
  splitLayoutProps,
  toResponsiveVars,
} from '../shared/index.js';
import { containerBase } from './Container.css.js';

/**
 * Named container widths. Consumed via the `--cynosure-container-maxw-{bp}`
 * custom property chain so `size` can be responsive without switching classes.
 */
const CONTAINER_MAX_WIDTHS = {
  sm: '40rem', //  640px
  md: '48rem', //  768px
  lg: '64rem', // 1024px (default)
  xl: '80rem', // 1280px
  '2xl': '96rem', // 1536px
  prose: '65ch',
  full: '100%',
} as const;

export type ContainerSize = keyof typeof CONTAINER_MAX_WIDTHS;

export interface ContainerOwnProps extends LayoutProps, AsChildProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /**
   * Max-width preset: `sm`, `md`, `lg` (default), `xl`, `2xl`, `prose` (65ch),
   * `full`. Accepts a responsive object too — e.g. `size={{ base: 'sm', md: 'lg' }}`.
   */
  size?: Responsive<ContainerSize>;
}

export type ContainerProps<E extends ElementType = 'div'> = ContainerOwnProps & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof ContainerOwnProps | 'as'>;

type AnyProps = ContainerOwnProps & { as?: ElementType; [key: string]: unknown };

const ContainerRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const { as, asChild, className, style, children, size = 'lg', ...rest } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as ContainerOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const sizeStyle = toResponsiveVars(
    size,
    'cynosure-container-maxw',
    (v) => CONTAINER_MAX_WIDTHS[v],
  );
  const mergedStyle = mergeStyles(layoutStyle, sizeStyle, style);

  const Comp: ElementType = asChild ? Slot : (as ?? 'div');

  return (
    <Comp
      ref={ref}
      className={cn(containerBase, className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {children}
    </Comp>
  );
};

/**
 * Max-width container, horizontally centred. Pass one of the predefined
 * `size`s (`sm`/`md`/`lg`/`xl`/`2xl`/`prose`/`full`) — either flat or
 * responsive (`{ base: 'sm', md: 'lg' }`) — and optionally responsive
 * `paddingX` for gutter behaviour.
 */
export const Container = forwardRef<Element, AnyProps>(ContainerRender) as <
  E extends ElementType = 'div',
>(
  props: ContainerProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
