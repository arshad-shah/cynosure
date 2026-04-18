import type { ComponentPropsWithoutRef, ElementType, ReactElement, Ref } from 'react';

/**
 * Minimal polymorphic component helper. Every Cynosure layout primitive accepts
 * either an `as` prop (renders that intrinsic/custom element) or `asChild`
 * (uses `Slot` to merge props onto the single child). Only `as` participates
 * in the polymorphic type narrowing — `asChild` keeps the declared element's
 * props (default `div`) because the child's type is unknown at this layer.
 */

export type AsChildProps = {
  /**
   * When `true`, renders the primitive's single React child via `Slot`,
   * forwarding className/style/ref/event handlers onto it.
   */
  asChild?: boolean;
};

export type PolymorphicProps<E extends ElementType, OwnProps> = OwnProps &
  AsChildProps &
  Omit<ComponentPropsWithoutRef<E>, keyof OwnProps | 'as' | 'asChild' | 'ref'> & {
    /** Render as this element/component. Mutually exclusive with `asChild`. */
    as?: E;
    ref?: Ref<unknown>;
  };

export type PolymorphicComponent<Default extends ElementType, OwnProps> = <
  E extends ElementType = Default,
>(
  props: PolymorphicProps<E, OwnProps>,
) => ReactElement | null;
