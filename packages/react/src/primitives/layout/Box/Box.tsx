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

/**
 * Props specific to `Box` — only `className`, `style`, and `children` on top
 * of the universal `LayoutProps` / `AsChildProps` surfaces.
 */
export interface BoxOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged after computed layout styles.
   */
  style?: CSSProperties;
  /**
   * Rendered content.
   */
  children?: ReactNode;
}

/**
 * Full `Box` props. Generic over the rendered element so `BoxProps<"a">`
 * carries `<a>`-specific attributes (`href`, etc.) alongside Cynosure props.
 */
export type BoxProps<E extends ElementType = 'div'> = BoxOwnProps & {
  /**
   * Rendered intrinsic element or component.
   * @default "div"
   */
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
