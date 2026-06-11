import {
  type CSSProperties,
  Children,
  type ElementType,
  Fragment,
  type ReactNode,
  isValidElement,
} from 'react';
import { Divider } from '../Divider/Divider.js';
import {
  type AsChildProps,
  type LayoutProps,
  type PolymorphicProps,
  type Responsive,
  type SpaceToken,
  createLayoutComponent,
  mergeStyles,
  resolveSpace,
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

/**
 * Props specific to `Stack`, layered on `LayoutProps` and `AsChildProps`.
 */
export interface StackOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Stack children.
   */
  children?: ReactNode;
  /**
   * Vertical gap between children, from the spacing scale.
   */
  gap?: Responsive<SpaceToken>;
  /**
   * Cross-axis alignment — maps to `align-items` on the flex container.
   */
  align?: Responsive<StackAlign>;
  /**
   * Main-axis distribution — maps to `justify-content` on the flex container.
   */
  justify?: Responsive<StackJustify>;
  /**
   * When `true`, inserts a `<Divider/>` between children. Pass a custom node
   * (e.g. `<Divider variant="dashed" />`) to use that instead.
   */
  dividers?: boolean | ReactNode;
}

/**
 * Full `Stack` props. Generic over the rendered element.
 */
export type StackProps<E extends ElementType = 'div'> = PolymorphicProps<E, StackOwnProps>;

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

/**
 * Vertical flex container. Stacks children top-to-bottom with a consistent
 * `gap`. `align` controls cross-axis alignment (`align-items`), `justify`
 * controls main-axis (`justify-content`). Set `dividers` to sprinkle a
 * `<Divider/>` (or any node you pass) between every pair of children.
 */
export const Stack = createLayoutComponent<StackOwnProps>({
  base: stack,
  displayName: 'Stack',
  ownKeys: ['gap', 'align', 'justify', 'dividers'],
  resolveStyle: ({ gap, align, justify }) =>
    mergeStyles(
      toResponsiveVars(gap, 'cynosure-stack-gap', (v) => resolveSpace(v)),
      toResponsiveVars(align, 'cynosure-stack-align', (v) => ALIGN_MAP[v]),
      toResponsiveVars(justify, 'cynosure-stack-justify', (v) => JUSTIFY_MAP[v]),
    ),
  transformChildren: (children, { dividers }) =>
    dividers ? interleave(children, dividers === true ? <Divider /> : dividers) : children,
});
