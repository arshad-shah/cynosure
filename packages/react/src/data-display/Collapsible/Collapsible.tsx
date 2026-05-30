import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { Slot } from '../../primitives/Slot.js';
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import { collapsibleContent, collapsibleRoot } from './Collapsible.css.js';

// Held in a constant so biome's `useSemanticElements` doesn't suggest
// rewriting to `<section>`. `<div role="region">` matches the Radix
// contract; switching to `<section>` would change the default UA styles
// (top/bottom margins on heading children) and break existing CSS.
const REGION_ROLE = 'region';

/** Props for the {@link Collapsible} root. */
export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires with the next open state when toggled. */
  onOpenChange?: (open: boolean) => void;
  /** Disables the trigger and locks the panel in its current state. */
  disabled?: boolean;
}

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerId: string;
  disabled?: boolean;
}

const CollapsibleCtx = createContext<CollapsibleContextValue | null>(null);
const useCollapsibleCtx = (): CollapsibleContextValue => {
  const ctx = useContext(CollapsibleCtx);
  if (!ctx) throw new Error('Collapsible subcomponent must be used within <Collapsible>');
  return ctx;
};

/**
 * Single show/hide disclosure widget. Pairs with {@link CollapsibleTrigger}
 * (any focusable button) and {@link CollapsibleContent}. State surface
 * matches the Radix contract so existing CSS keeps working —
 * `data-state="open"|"closed"` on root and children, plus
 * `--cynosure-collapsible-content-height` (mirrored as
 * `--radix-collapsible-content-height`) on the content for height
 * animations. Owned in-tree (no Radix dep).
 */
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { open: openProp, defaultOpen, onOpenChange, disabled, className, ...rest },
  ref,
) {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const idBase = useId();
  const contextValue = useMemo<CollapsibleContextValue>(
    () => ({
      open,
      setOpen,
      contentId: `${idBase}-content`,
      triggerId: `${idBase}-trigger`,
      disabled,
    }),
    [open, setOpen, idBase, disabled],
  );
  return (
    <CollapsibleCtx.Provider value={contextValue}>
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        className={cn(collapsibleRoot, className)}
        {...rest}
      />
    </CollapsibleCtx.Provider>
  );
});

/** Props for {@link CollapsibleTrigger}. */
export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Compose the trigger onto a single child element instead of rendering a
   * `<button>`. Use when the trigger needs to be a link or a custom button.
   */
  asChild?: boolean;
}

/** Trigger button that toggles its sibling {@link CollapsibleContent}. */
export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger(
    { onClick, disabled: localDisabled, type = 'button', asChild, ...rest },
    ref,
  ) {
    const ctx = useCollapsibleCtx();
    const disabled = localDisabled ?? ctx.disabled;
    const triggerProps = {
      id: ctx.triggerId,
      'aria-controls': ctx.contentId,
      'aria-expanded': ctx.open,
      'data-state': ctx.open ? 'open' : 'closed',
      'data-disabled': disabled || undefined,
      disabled,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (disabled) return;
        ctx.setOpen(!ctx.open);
      },
      ...rest,
    };
    if (asChild) {
      return <Slot ref={ref} {...triggerProps} />;
    }
    return <button ref={ref} type={type} {...triggerProps} />;
  },
);

/** Props for {@link CollapsibleContent}. */
export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Keep the content mounted at all times. Default unmounts the content
   * while closed so descendants don't run effects when hidden.
   */
  forceMount?: boolean;
}

/**
 * The expanding panel revealed by a {@link CollapsibleTrigger}. Sets the
 * `--cynosure-collapsible-content-height` custom property (and the legacy
 * `--radix-collapsible-content-height` mirror) so CSS keyframes can
 * animate height between 0 and the measured intrinsic value.
 */
export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ className, forceMount, style, children, ...rest }, ref) {
    const ctx = useCollapsibleCtx();
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const setRefs = useMemo(
      () =>
        composeRefs<HTMLDivElement>(ref, (node) => {
          innerRef.current = node;
        }),
      [ref],
    );

    const measure = useCallback(() => {
      if (innerRef.current) setHeight(innerRef.current.scrollHeight);
    }, []);

    useEffect(() => {
      if (!innerRef.current) return undefined;
      measure();
      // Re-measure whenever the panel's intrinsic height changes (children
      // mount, fonts load, async content arrives, viewport reflows).
      if (typeof ResizeObserver === 'undefined') return undefined;
      const ro = new ResizeObserver(measure);
      ro.observe(innerRef.current);
      return () => ro.disconnect();
    }, [measure]);

    if (!forceMount && !ctx.open) return null;

    const heightVar = height ?? 0;
    return (
      <div
        ref={setRefs}
        id={ctx.contentId}
        role={REGION_ROLE}
        aria-labelledby={ctx.triggerId}
        data-state={ctx.open ? 'open' : 'closed'}
        data-disabled={ctx.disabled || undefined}
        className={cn(collapsibleContent, className)}
        style={
          {
            ...style,
            '--cynosure-collapsible-content-height': `${heightVar}px`,
            '--radix-collapsible-content-height': `${heightVar}px`,
          } as CSSProperties
        }
        {...rest}
      >
        {children}
      </div>
    );
  },
);

/** Disclosure — semantic alias of Collapsible. */
export const Disclosure = Collapsible;
export const DisclosureTrigger = CollapsibleTrigger;
export const DisclosureContent = CollapsibleContent;
