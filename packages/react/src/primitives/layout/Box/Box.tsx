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
import { box } from './Box.css.js';

export interface BoxOwnProps extends LayoutProps, AsChildProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type BoxProps<E extends ElementType = 'div'> = BoxOwnProps & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof BoxOwnProps | 'as'>;

type AnyProps = BoxOwnProps & {
  as?: ElementType;
  [key: string]: unknown;
};

const BoxRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const { as, asChild, className, style, children, ...rest } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as BoxOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const mergedStyle = mergeStyles(layoutStyle, style);

  const Comp: ElementType = asChild ? Slot : (as ?? 'div');

  return (
    <Comp
      ref={ref}
      className={cn(box, className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {children}
    </Comp>
  );
};

/**
 * The zero-opinion layout primitive. Renders a `<div>` by default; accepts
 * the full `LayoutProps` surface plus any intrinsic attributes of `as`.
 *
 * Use `asChild` to merge Box's layout class/style onto the single child
 * element — useful for composing layout on top of an `<a>`, `<button>`, or
 * other library component.
 */
export const Box = forwardRef<Element, AnyProps>(BoxRender) as <E extends ElementType = 'div'>(
  props: BoxProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
