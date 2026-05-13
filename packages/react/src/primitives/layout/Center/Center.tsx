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
import { center } from './Center.css.js';

/**
 * Props specific to `Center` — only `className`, `style`, and `children` on
 * top of `LayoutProps` and `AsChildProps`.
 */
export interface CenterOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Content centred on both axes.
   */
  children?: ReactNode;
}

/**
 * Full `Center` props. Generic over the rendered element.
 */
export type CenterProps<E extends ElementType = 'div'> = CenterOwnProps & {
  /**
   * Rendered intrinsic element or component.
   * @default "div"
   */
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof CenterOwnProps | 'as'>;

type AnyProps = CenterOwnProps & { as?: ElementType; [key: string]: unknown };

const CenterRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const { as, asChild, className, style, children, ...rest } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as CenterOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const mergedStyle = mergeStyles(layoutStyle, style);

  const Comp: ElementType = asChild ? Slot : (as ?? 'div');

  return (
    <Comp
      ref={ref}
      className={cn(center, className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {children}
    </Comp>
  );
};

/**
 * Centres its child on both axes via `display: flex; align-items: center;
 * justify-content: center;`. Typically used with a `minHeight` (e.g.
 * `minHeight="screen"`) to centre inside a viewport.
 */
export const Center = forwardRef<Element, AnyProps>(CenterRender) as <
  E extends ElementType = 'div',
>(
  props: CenterProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
