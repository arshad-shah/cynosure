import {
  type CSSProperties,
  Children,
  Fragment,
  type HTMLAttributes,
  type JSX,
  type ReactElement,
  type ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react';
import { composeRefs } from '../utils/composeRefs.js';

/**
 * `Slot` composes its props onto the single React element passed as a child,
 * replacing the wrapper. Used by every Cynosure component that exposes an
 * `asChild` API so a `<Button asChild><a href="…"/></Button>` renders one
 * `<a>` instead of `<button><a/></button>`.
 *
 * We own this instead of pulling `@radix-ui/react-slot` because the contract
 * is small and the dep added a transitive footprint. The behaviour mirrors
 * Radix's: merge `className` (space-joined), `style` (slot underlays
 * child), event handlers (both fire, child first, slot second), refs
 * (composed), and pass-through every other prop with child winning.
 *
 * `Slottable` is a marker the parent uses to mark which child holds the
 * forwarded content slot when multiple children are present (e.g. Button
 * wrapping a spinner + label as siblings).
 */

const SLOTTABLE_TAG = Symbol.for('cynosure.slottable');

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

type AnyProps = Record<string, unknown>;

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...childProps };
  for (const name in childProps) {
    const slotVal = slotProps[name];
    const childVal = childProps[name];
    if (/^on[A-Z]/.test(name)) {
      // Event handler — call both; child first, slot second. Slot's return
      // value is dropped (parents that read return values from event
      // handlers don't compose this way).
      if (typeof slotVal === 'function' && typeof childVal === 'function') {
        merged[name] = (...args: unknown[]) => {
          (childVal as (...a: unknown[]) => unknown)(...args);
          (slotVal as (...a: unknown[]) => unknown)(...args);
        };
      } else if (typeof slotVal === 'function') {
        merged[name] = slotVal;
      }
    } else if (name === 'style') {
      merged[name] = {
        ...(slotVal as CSSProperties | undefined),
        ...(childVal as CSSProperties | undefined),
      };
    } else if (name === 'className') {
      merged[name] = [slotVal, childVal].filter(Boolean).join(' ');
    }
  }
  return { ...slotProps, ...merged };
}

type RefLike<T> = ((node: T | null) => void) | { current: T | null } | null | undefined;
function getElementRef(element: ReactElement): RefLike<unknown> {
  // React 19 moved `ref` from `element.ref` to `element.props.ref` (with a
  // deprecation getter on `element.ref`). Read the props.ref descriptor first;
  // fall back to `element.ref` for React 17/18. The `isReactWarning` check
  // avoids triggering the dev-only deprecation log on whichever path the
  // current React version doesn't use.
  const propsRefDesc = Object.getOwnPropertyDescriptor(
    (element as unknown as { props: AnyProps }).props,
    'ref',
  );
  if (propsRefDesc?.get && 'isReactWarning' in propsRefDesc.get) {
    return (element as unknown as { ref?: RefLike<unknown> }).ref;
  }
  const refDesc = Object.getOwnPropertyDescriptor(element, 'ref');
  if (refDesc?.get && 'isReactWarning' in refDesc.get) {
    return (element as unknown as { props: AnyProps }).props.ref as RefLike<unknown>;
  }
  return (
    ((element as unknown as { props: AnyProps }).props.ref as RefLike<unknown>) ||
    (element as unknown as { ref?: RefLike<unknown> }).ref
  );
}

const SlotClone = forwardRef<HTMLElement, SlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  if (!isValidElement(children)) {
    return Children.count(children) > 1 ? Children.only(null) : null;
  }
  const childRef = getElementRef(children);
  const childProps = (children as unknown as { props: AnyProps }).props;
  const merged: AnyProps = mergeProps(slotProps as AnyProps, childProps);
  if (children.type !== Fragment) {
    merged.ref = forwardedRef ? composeRefs(forwardedRef, childRef) : childRef;
  }
  return cloneElement(children, merged);
});
SlotClone.displayName = 'Cynosure.SlotClone';

export const Slot = forwardRef<HTMLElement, SlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childArray = Children.toArray(children);
  // Find a Slottable marker child — when a parent renders extra siblings
  // (e.g. Button rendering label + spinner) we forward props onto the
  // actual root element and graft the siblings inside its children tree.
  const slottable = childArray.find(isSlottableElement);
  if (slottable) {
    const slottableChildren = (slottable as ReactElement).props
      ? ((slottable as unknown as { props: { children: ReactNode } }).props.children as ReactNode)
      : null;
    const newChildren = childArray.map((child) => {
      if (child === slottable) {
        if (Children.count(slottableChildren) > 1) return Children.only(null);
        return isValidElement(slottableChildren)
          ? ((slottableChildren as unknown as { props: { children: ReactNode } }).props
              .children as ReactNode)
          : null;
      }
      return child;
    });
    return (
      <SlotClone {...slotProps} ref={forwardedRef}>
        {isValidElement(slottableChildren)
          ? cloneElement(slottableChildren, undefined, newChildren)
          : null}
      </SlotClone>
    );
  }
  return (
    <SlotClone {...slotProps} ref={forwardedRef}>
      {children}
    </SlotClone>
  );
});
Slot.displayName = 'Cynosure.Slot';

interface SlottableComponent {
  ({ children }: { children: ReactNode }): JSX.Element;
  displayName: string;
  __cynosureSlottable: typeof SLOTTABLE_TAG;
}

export const Slottable: SlottableComponent = (({ children }: { children: ReactNode }) => (
  <>{children}</>
)) as SlottableComponent;
Slottable.displayName = 'Cynosure.Slottable';
Slottable.__cynosureSlottable = SLOTTABLE_TAG;

function isSlottableElement(node: ReactNode): node is ReactElement {
  return (
    isValidElement(node) &&
    typeof node.type === 'function' &&
    '__cynosureSlottable' in node.type &&
    (node.type as { __cynosureSlottable?: symbol }).__cynosureSlottable === SLOTTABLE_TAG
  );
}
