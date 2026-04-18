import {
  type CSSProperties,
  Children,
  type ElementType,
  type ForwardedRef,
  Fragment,
  type ReactElement,
  type ReactNode,
  forwardRef,
  isValidElement,
} from 'react';
import { cn } from '../../../utils/cn.js';
import { Slot } from '../../Slot.js';
import { Divider } from '../Divider/Divider.js';
import {
  type AsChildProps,
  type LayoutProps,
  type Responsive,
  type SpaceToken,
  mergeStyles,
  resolveLayoutProps,
  resolveSpace,
  splitLayoutProps,
  toResponsiveVars,
} from '../shared/index.js';
import { stack } from './Stack.css.js';

export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const ALIGN_MAP: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

const JUSTIFY_MAP: Record<StackJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export interface StackOwnProps extends LayoutProps, AsChildProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  gap?: Responsive<SpaceToken>;
  align?: Responsive<StackAlign>;
  justify?: Responsive<StackJustify>;
  /**
   * When truthy, inserts a `<Divider/>` between children. Pass a custom node
   * to use that instead.
   */
  dividers?: boolean | ReactNode;
}

export type StackProps<E extends ElementType = 'div'> = StackOwnProps & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof StackOwnProps | 'as'>;

type AnyProps = StackOwnProps & { as?: ElementType; [key: string]: unknown };

const interleave = (children: ReactNode, divider: ReactNode): ReactNode => {
  const array = Children.toArray(children).filter(
    (child) => child !== null && child !== undefined && child !== '',
  );
  if (array.length < 2) return children;
  const out: ReactNode[] = [];
  array.forEach((child, i) => {
    out.push(child);
    if (i < array.length - 1) {
      const key =
        isValidElement(child) && child.key !== null
          ? `cynosure-divider-${child.key}`
          : `cynosure-divider-${i}`;
      out.push(<Fragment key={key}>{divider}</Fragment>);
    }
  });
  return out;
};

const StackRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const { as, asChild, className, style, children, gap, align, justify, dividers, ...rest } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as StackOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const stackStyle = mergeStyles(
    toResponsiveVars(gap, 'cynosure-stack-gap', (v) => resolveSpace(v)),
    toResponsiveVars(align, 'cynosure-stack-align', (v) => ALIGN_MAP[v]),
    toResponsiveVars(justify, 'cynosure-stack-justify', (v) => JUSTIFY_MAP[v]),
  );
  const mergedStyle = mergeStyles(layoutStyle, stackStyle, style);

  const resolvedChildren = dividers
    ? interleave(children, dividers === true ? <Divider /> : dividers)
    : children;

  const Comp: ElementType = asChild ? Slot : (as ?? 'div');

  return (
    <Comp
      ref={ref}
      className={cn(stack, className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {resolvedChildren}
    </Comp>
  );
};

/**
 * Vertical flex container. Stacks children top-to-bottom with a consistent
 * `gap`. `align` controls cross-axis alignment (`align-items`), `justify`
 * controls main-axis (`justify-content`). Set `dividers` to sprinkle a
 * `<Divider/>` (or any node you pass) between every pair of children.
 */
export const Stack = forwardRef<Element, AnyProps>(StackRender) as <E extends ElementType = 'div'>(
  props: StackProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
