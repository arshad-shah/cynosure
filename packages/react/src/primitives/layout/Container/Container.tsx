import type { CSSProperties, ElementType, ReactNode } from 'react';
import {
  type AsChildProps,
  type LayoutProps,
  type PolymorphicProps,
  type Responsive,
  createLayoutComponent,
  toResponsiveVars,
} from '../shared/index.js';
import { containerBase } from './Container.css.js';

/**
 * Container max-width preset.
 */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'prose' | 'full';

/**
 * Named container widths. Consumed via the `--cynosure-container-maxw-{bp}`
 * custom property chain so `size` can be responsive without switching classes.
 */
const CONTAINER_MAX_WIDTHS: Record<ContainerSize, string> = {
  sm: '40rem', //  640px
  md: '48rem', //  768px
  lg: '64rem', // 1024px (default)
  xl: '80rem', // 1280px
  '2xl': '96rem', // 1536px
  prose: '65ch',
  full: '100%',
};

/**
 * Props specific to `Container`, layered on `LayoutProps` and `AsChildProps`.
 */
export interface ContainerOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Container content.
   */
  children?: ReactNode;
  /**
   * Max-width preset: `sm` (40rem), `md` (48rem), `lg` (64rem), `xl` (80rem),
   * `2xl` (96rem), `prose` (65ch), `full` (100%). Accepts a responsive object,
   * e.g. `size={{ base: 'sm', md: 'lg' }}`.
   * @default "lg"
   */
  size?: Responsive<ContainerSize>;
}

/**
 * Full `Container` props. Generic over the rendered element.
 */
export type ContainerProps<E extends ElementType = 'div'> = PolymorphicProps<E, ContainerOwnProps>;

/**
 * Max-width container, horizontally centred. Pass one of the predefined
 * `size`s (`sm`/`md`/`lg`/`xl`/`2xl`/`prose`/`full`) — either flat or
 * responsive (`{ base: 'sm', md: 'lg' }`) — and optionally responsive
 * `paddingX` for gutter behaviour.
 */
export const Container = createLayoutComponent<ContainerOwnProps>({
  base: containerBase,
  displayName: 'Container',
  ownKeys: ['size'],
  resolveStyle: ({ size = 'lg' }) =>
    toResponsiveVars(size, 'cynosure-container-maxw', (v) => CONTAINER_MAX_WIDTHS[v]),
});
