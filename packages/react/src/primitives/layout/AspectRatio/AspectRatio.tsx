import type { CSSProperties, ElementType, ReactNode } from 'react';
import {
  type AsChildProps,
  type LayoutProps,
  type PolymorphicProps,
  createLayoutComponent,
} from '../shared/index.js';
import { aspectRatio } from './AspectRatio.css.js';

/**
 * Props specific to `AspectRatio`, layered on `LayoutProps` and `AsChildProps`.
 */
export interface AspectRatioOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Single child whose box is constrained to `ratio`.
   */
  children?: ReactNode;
  /**
   * Aspect ratio. Accepts a number (`16/9`) or a string (`"16 / 9"`).
   * @default 1
   */
  ratio?: number | string;
}

/**
 * Full `AspectRatio` props. Generic over the rendered element.
 */
export type AspectRatioProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  AspectRatioOwnProps
>;

/**
 * Maintains an aspect ratio for its child via the native `aspect-ratio` CSS
 * property (no padding hack). Common values: `16/9`, `4/3`, `1`, `"21 / 9"`.
 */
export const AspectRatio = createLayoutComponent<AspectRatioOwnProps>({
  base: aspectRatio,
  displayName: 'AspectRatio',
  ownKeys: ['ratio'],
  resolveStyle: ({ ratio = 1 }) => ({ ['--cynosure-aspect-ratio' as string]: String(ratio) }),
});
