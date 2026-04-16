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
import { aspectRatio } from './AspectRatio.css.js';

export interface AspectRatioOwnProps extends LayoutProps, AsChildProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Ratio as a number (`16/9`) or a string (`"16 / 9"`). Defaults to `1`. */
  ratio?: number | string;
}

export type AspectRatioProps<E extends ElementType = 'div'> = AspectRatioOwnProps & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof AspectRatioOwnProps | 'as'>;

type AnyProps = AspectRatioOwnProps & { as?: ElementType; [key: string]: unknown };

const AspectRatioRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const { as, asChild, className, style, children, ratio = 1, ...rest } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as AspectRatioOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const ratioStyle: CSSProperties = {
    ['--lumen-aspect-ratio' as string]: String(ratio),
  };
  const mergedStyle = mergeStyles(layoutStyle, ratioStyle, style);

  const Comp: ElementType = asChild ? Slot : (as ?? 'div');

  return (
    <Comp
      ref={ref}
      className={cn(aspectRatio, className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {children}
    </Comp>
  );
};

/**
 * Maintains an aspect ratio for its child via the native `aspect-ratio` CSS
 * property (no padding hack). Common values: `16/9`, `4/3`, `1`, `"21 / 9"`.
 */
export const AspectRatio = forwardRef<Element, AnyProps>(AspectRatioRender) as <
  E extends ElementType = 'div',
>(
  props: AspectRatioProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
