import type { CSSProperties, ElementType, ReactNode } from 'react';
import {
  type AsChildProps,
  type LayoutProps,
  type PolymorphicProps,
  createLayoutComponent,
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
export type CenterProps<E extends ElementType = 'div'> = PolymorphicProps<E, CenterOwnProps>;

/**
 * Centres its child on both axes via `display: flex; align-items: center;
 * justify-content: center;`. Typically used with a `minHeight` (e.g.
 * `minHeight="screen"`) to centre inside a viewport.
 */
export const Center = createLayoutComponent<CenterOwnProps>({
  base: center,
  displayName: 'Center',
});
