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
import type { AsChildProps, PolymorphicComponent } from './polymorphic.js';
import { resolveLayoutProps, splitLayoutProps } from './resolveLayoutProps.js';
import { mergeStyles } from './responsive.js';
import type { LayoutProps } from './types.js';

/**
 * Configuration for {@link createLayoutComponent}.
 *
 * @typeParam Own - the primitive's own props (extends `LayoutProps` +
 *   `AsChildProps`, plus any variant props like `gap`/`align`).
 */
export interface LayoutComponentConfig<Own> {
  /**
   * The vanilla-extract base class for the primitive — a static class, or a
   * function of the primitive's own props for variant-dependent classes (e.g.
   * Section's padding preset). Any own prop the function reads must be listed
   * in {@link ownKeys}.
   */
  base: string | ((own: Own) => string);
  /** Display name for React devtools. */
  displayName: string;
  /**
   * Element rendered when neither `as` nor `asChild` is set.
   * @default 'div'
   */
  defaultAs?: ElementType;
  /**
   * Names of the primitive's own variant props (e.g. `['gap', 'align']`). These
   * are pulled out of the rest before DOM props are spread, so they never reach
   * the element — and are handed to {@link resolveStyle} / {@link transformChildren}.
   */
  ownKeys?: readonly string[];
  /** Build the primitive's variant style from its extracted own props. */
  resolveStyle?: (own: Own) => CSSProperties | undefined;
  /** Transform children before render (e.g. interleaving dividers). */
  transformChildren?: (children: ReactNode, own: Own) => ReactNode;
}

/**
 * Build a polymorphic layout primitive from a base class and a small amount of
 * per-primitive logic.
 *
 * Every Cynosure layout primitive shares the same skeleton: split the universal
 * `LayoutProps` off the DOM props, resolve them to a style, merge the
 * primitive's own variant style and the consumer `style`, then render `as`
 * (or `Slot` for `asChild`) with `cn(base, className)`. This factory owns that
 * skeleton — and the single unavoidable polymorphic-`forwardRef` cast — so each
 * primitive only declares its base class, its own prop keys, and how those map
 * to a style. The result is typed via the shared {@link PolymorphicComponent},
 * so `as="a"` still narrows to anchor props.
 */
export function createLayoutComponent<
  Own extends LayoutProps & AsChildProps,
  Default extends ElementType = 'div',
>(config: LayoutComponentConfig<Own>): PolymorphicComponent<Default, Own> {
  const {
    base,
    displayName,
    defaultAs = 'div',
    ownKeys = [],
    resolveStyle,
    transformChildren,
  } = config;
  const ownKeySet = new Set<string>(ownKeys);

  type AnyProps = Own & {
    as?: ElementType;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    [key: string]: unknown;
  };

  const Render = (rawProps: Record<string, unknown>, ref: ForwardedRef<Element>): ReactElement => {
    const { as, asChild, className, style, children, ...rest } = rawProps as AnyProps;

    // Separate the primitive's own variant props from forwarded DOM/layout props.
    let own: Own;
    let forwarded: Record<string, unknown>;
    if (ownKeySet.size === 0) {
      own = {} as Own;
      forwarded = rest as Record<string, unknown>;
    } else {
      const ownAcc: Record<string, unknown> = {};
      forwarded = {};
      for (const key of Object.keys(rest)) {
        if (ownKeySet.has(key)) ownAcc[key] = (rest as Record<string, unknown>)[key];
        else forwarded[key] = (rest as Record<string, unknown>)[key];
      }
      own = ownAcc as Own;
    }

    const { layoutProps, rest: domProps } = splitLayoutProps(forwarded as Partial<LayoutProps>);
    const layoutStyle = resolveLayoutProps(layoutProps);
    const ownStyle = resolveStyle?.(own);
    const mergedStyle = mergeStyles(layoutStyle, ownStyle, style);

    const kids = transformChildren ? transformChildren(children, own) : children;
    const Comp: ElementType = asChild ? Slot : (as ?? defaultAs);
    const baseClass = typeof base === 'function' ? base(own) : base;

    return (
      <Comp
        ref={ref}
        className={cn(baseClass, className)}
        style={mergedStyle}
        {...(domProps as Record<string, unknown>)}
      >
        {kids}
      </Comp>
    );
  };
  Render.displayName = displayName;

  const Component = forwardRef(Render);
  Component.displayName = displayName;
  // The single polymorphic cast for every primitive — see PolymorphicComponent.
  return Component as unknown as PolymorphicComponent<Default, Own>;
}
