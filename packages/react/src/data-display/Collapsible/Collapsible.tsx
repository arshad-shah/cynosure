import { Slot } from '@radix-ui/react-slot';
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import { collapsibleContent, collapsibleRoot } from './Collapsible.css.js';

type CollapsibleContextValue = {
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
  toggle: () => void;
};

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(component: string): CollapsibleContextValue {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <Collapsible>.`);
  }
  return ctx;
}

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const isControlled = controlled !== undefined;
  const [internal, setInternal] = useState<T>(defaultValue);
  const value = isControlled ? (controlled as T) : internal;
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );
  return [value, setValue];
}

/** Props for the {@link Collapsible} root. */
export interface CollapsibleProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * Collapsible is a single show/hide disclosure widget. Pair with
 * {@link CollapsibleTrigger} (any focusable button — or pass `asChild` to use
 * your own) and {@link CollapsibleContent}. The open state is exposed via
 * `data-state="open|closed"` for styling.
 */
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { open: openProp, defaultOpen = false, onOpenChange, disabled = false, className, ...rest },
  ref,
) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;

  const toggle = useCallback(() => {
    if (!disabled) setOpen(!open);
  }, [disabled, open, setOpen]);

  const ctx: CollapsibleContextValue = { open, disabled, triggerId, contentId, toggle };

  return (
    <CollapsibleContext.Provider value={ctx}>
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        className={cn(collapsibleRoot, className)}
        {...rest}
      />
    </CollapsibleContext.Provider>
  );
});

/** Props for the {@link CollapsibleTrigger} button. */
export interface CollapsibleTriggerProps extends ComponentPropsWithoutRef<'button'> {
  /**
   * Render as the immediate child element (using `@radix-ui/react-slot`) so
   * a custom `<Button>` or anchor becomes the trigger. The child must accept
   * `onClick`, `aria-expanded`, `aria-controls`, and `data-state` props.
   * @default false
   */
  asChild?: boolean;
}

/** The button that toggles the disclosure. Pass `asChild` to use your own element. */
export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ asChild, onClick, disabled, ...rest }, ref) {
    const ctx = useCollapsibleContext('CollapsibleTrigger');
    const isDisabled = disabled ?? ctx.disabled;
    const Comp: React.ElementType = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : 'button'}
        id={ctx.triggerId}
        aria-expanded={ctx.open}
        aria-controls={ctx.contentId}
        data-state={ctx.open ? 'open' : 'closed'}
        data-disabled={isDisabled ? '' : undefined}
        disabled={isDisabled}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          ctx.toggle();
        }}
        {...rest}
      />
    );
  },
);

/** Props for the {@link CollapsibleContent} animated panel. */
export interface CollapsibleContentProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Keep the content in the DOM regardless of open state (useful for SEO /
   * crawlers). Defaults to mount-only-when-open.
   * @default false
   */
  forceMount?: boolean;
}

/**
 * The expanding panel revealed by a {@link CollapsibleTrigger}. Animates its
 * height open/close using a measured `scrollHeight` and a CSS height
 * transition; respects `prefers-reduced-motion`.
 */
export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent(
    { className, children, style, forceMount: _forceMount, ...rest },
    ref,
  ) {
    const ctx = useCollapsibleContext('CollapsibleContent');
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState<number | 'auto' | undefined>(ctx.open ? 'auto' : 0);
    const firstRender = useRef(true);

    useLayoutEffect(() => {
      const inner = innerRef.current;
      if (!inner) return;
      const measured = inner.scrollHeight;
      if (firstRender.current) {
        firstRender.current = false;
        setHeight(ctx.open ? 'auto' : 0);
        return;
      }
      if (ctx.open) {
        setHeight(0);
        requestAnimationFrame(() => setHeight(measured));
      } else {
        setHeight(measured);
        requestAnimationFrame(() => setHeight(0));
      }
    }, [ctx.open]);

    const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== 'height') return;
      if (ctx.open) setHeight('auto');
    };

    return (
      <div
        ref={ref}
        id={ctx.contentId}
        aria-labelledby={ctx.triggerId}
        data-state={ctx.open ? 'open' : 'closed'}
        data-disabled={ctx.disabled ? '' : undefined}
        hidden={!ctx.open && height === 0}
        className={cn(collapsibleContent, className)}
        style={{ height: height === 'auto' ? undefined : height, ...style }}
        onTransitionEnd={handleTransitionEnd}
        {...rest}
      >
        <div ref={innerRef}>{children}</div>
      </div>
    );
  },
);

/** Disclosure — semantic alias of Collapsible. */
export const Disclosure = Collapsible;
export const DisclosureTrigger = CollapsibleTrigger;
export const DisclosureContent = CollapsibleContent;
