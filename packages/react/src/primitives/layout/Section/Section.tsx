import type { CSSProperties, ElementType, ReactNode } from 'react';
import {
  type AsChildProps,
  type LayoutProps,
  type PolymorphicProps,
  createLayoutComponent,
} from '../shared/index.js';
import { sectionBase, sectionSpace } from './Section.css.js';

export type SectionSpace = 'sm' | 'md' | 'lg' | 'xl';
export type SectionElement = 'section' | 'main' | 'article' | 'aside';

/**
 * Props specific to `Section`, layered on `LayoutProps` and `AsChildProps`.
 */
export interface SectionOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Section content.
   */
  children?: ReactNode;
  /**
   * Vertical padding preset — `sm`, `md`, `lg`, or `xl` — driving the band's
   * top/bottom rhythm.
   * @default "md"
   */
  space?: SectionSpace;
}

/**
 * Full `Section` props. Generic over the rendered element.
 */
export type SectionProps<E extends ElementType = 'section'> = PolymorphicProps<E, SectionOwnProps>;

/**
 * Semantic `<section>` with vertical rhythm. Use for full-width page bands
 * (hero, features, footer). Wrap a `<Container>` inside it to contain width.
 */
export const Section = createLayoutComponent<SectionOwnProps, 'section'>({
  base: ({ space = 'md' }) => `${sectionBase} ${sectionSpace[space]}`,
  displayName: 'Section',
  defaultAs: 'section',
  ownKeys: ['space'],
});
