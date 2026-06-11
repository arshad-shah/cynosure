import type { CSSProperties, ElementType, ReactNode } from 'react';
import {
  type AsChildProps,
  type LayoutProps,
  type PolymorphicProps,
  createLayoutComponent,
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
export type BoxProps<E extends ElementType = 'div'> = PolymorphicProps<E, BoxOwnProps>;

/**
 * The zero-opinion layout primitive. Renders a `<div>` by default; accepts
 * the full `LayoutProps` surface plus any intrinsic attributes of `as`.
 *
 * Use `asChild` to merge Box's layout class/style onto the single child
 * element — useful for composing layout on top of an `<a>`, `<button>`, or
 * other library component.
 */
export const Box = createLayoutComponent<BoxOwnProps>({
  base: box,
  displayName: 'Box',
});
