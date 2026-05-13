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
export type SectionProps<E extends ElementType = 'section'> = SectionOwnProps & {
  /**
   * Rendered intrinsic element — restrict to landmark tags for accessibility.
   * @default "section"
   */
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof SectionOwnProps | 'as'>;

type AnyProps = SectionOwnProps & { as?: ElementType; [key: string]: unknown };

const SectionRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const { as, asChild, className, style, children, space = 'md', ...rest } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as SectionOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const mergedStyle = mergeStyles(layoutStyle, style);

  const Comp: ElementType = asChild ? Slot : (as ?? 'section');

  return (
    <Comp
      ref={ref}
      className={cn(sectionBase, sectionSpace[space], className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {children}
    </Comp>
  );
};

/**
 * Semantic `<section>` with vertical rhythm. Use for full-width page bands
 * (hero, features, footer). Wrap a `<Container>` inside it to contain width.
 */
export const Section = forwardRef<Element, AnyProps>(SectionRender) as <
  E extends ElementType = 'section',
>(
  props: SectionProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
