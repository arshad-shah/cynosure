import { ChevronDownIcon } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
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
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import {
  accordionChevron,
  accordionContent,
  accordionContentInner,
  accordionHeader,
  accordionItem,
  accordionRoot,
  accordionSize,
  accordionTrigger,
} from './Accordion.css.js';

// Held in a constant so biome's `useSemanticElements` doesn't suggest
// rewriting to `<section>`. The aria-labelledby + role="region" combo is
// what AT expects for an accordion panel; switching to `<section>` would
// also change default UA styling that consumer CSS already targets.
const REGION_ROLE = 'region';

export type AccordionVariant = 'default' | 'contained' | 'ghost';
export type AccordionSize = 'sm' | 'md' | 'lg';

type Single = {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Force a non-empty selection in single mode. */
  collapsible?: boolean;
};
type Multiple = {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

/** Props for the {@link Accordion} root. */
export type AccordionProps = (Single | Multiple) & {
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  /**
   * Visual treatment. `default` shows divider lines, `contained` renders
   * each item as a separate bordered card, `ghost` removes all chrome.
   * @default "default"
   */
  variant?: AccordionVariant;
  /**
   * Controls trigger padding, font size, and chevron size.
   * @default "md"
   */
  size?: AccordionSize;
};

interface AccordionContextValue {
  type: 'single' | 'multiple';
  collapsible: boolean;
  disabled?: boolean;
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  registerTrigger: (node: HTMLButtonElement | null, value: string) => () => void;
  focusTrigger: (target: 'first' | 'last' | 'next' | 'prev', from: HTMLButtonElement) => void;
}

const AccordionCtx = createContext<AccordionContextValue | null>(null);
const useAccordionCtx = (): AccordionContextValue => {
  const ctx = useContext(AccordionCtx);
  if (!ctx) throw new Error('Accordion subcomponent must be used within <Accordion>');
  return ctx;
};

interface AccordionItemContextValue {
  value: string;
  triggerId: string;
  contentId: string;
  open: boolean;
  itemDisabled: boolean;
}
const AccordionItemCtx = createContext<AccordionItemContextValue | null>(null);
const useAccordionItemCtx = (): AccordionItemContextValue => {
  const ctx = useContext(AccordionItemCtx);
  if (!ctx) throw new Error('AccordionTrigger/AccordionContent must be nested in <AccordionItem>');
  return ctx;
};

/**
 * Vertically stacked set of headers that each reveal a panel. Use
 * `type="single"` for one-open-at-a-time behaviour or `type="multiple"` to
 * allow independent panels. Keyboard navigation (Up/Down/Home/End) and
 * `aria-expanded` are handled in-tree (no Radix dep).
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const { type, disabled, children, className, variant = 'default', size = 'md', ...rest } = props;
  const collapsible = type === 'single' ? ((props as Single).collapsible ?? true) : true;

  const [singleValue, setSingleValue] = useControllableState<string>({
    value: type === 'single' ? props.value : undefined,
    defaultValue: type === 'single' ? (props.defaultValue ?? '') : '',
    onChange: type === 'single' ? props.onValueChange : undefined,
  });
  // biome-ignore lint/correctness/useExhaustiveDependencies: defaultValue is captured on the first uncontrolled render only; re-reading it on prop change would clobber user-driven selection state.
  const initialMultiple = useMemo<string[]>(
    () => (type === 'multiple' ? ((props as Multiple).defaultValue ?? []) : []),
    [type],
  );
  const [multipleValue, setMultipleValue] = useControllableState<string[]>({
    value: type === 'multiple' ? props.value : undefined,
    defaultValue: initialMultiple,
    onChange: type === 'multiple' ? props.onValueChange : undefined,
  });

  const triggersRef = useRef<Array<{ node: HTMLButtonElement; value: string }>>([]);
  const registerTrigger = useCallback((node: HTMLButtonElement | null, value: string) => {
    if (!node) return () => {};
    triggersRef.current.push({ node, value });
    return () => {
      const i = triggersRef.current.findIndex((t) => t.node === node);
      if (i >= 0) triggersRef.current.splice(i, 1);
    };
  }, []);
  const focusTrigger = useCallback<AccordionContextValue['focusTrigger']>((target, from) => {
    const enabled = triggersRef.current
      .filter(({ node }) => !node.disabled)
      .map(({ node }) => node);
    if (enabled.length === 0) return;
    const idx = enabled.indexOf(from);
    let next = idx;
    if (target === 'first') next = 0;
    else if (target === 'last') next = enabled.length - 1;
    else if (target === 'next') next = (idx + 1) % enabled.length;
    else next = (idx - 1 + enabled.length) % enabled.length;
    enabled[next]?.focus();
  }, []);

  const isOpen = useCallback(
    (v: string) => (type === 'single' ? singleValue === v : multipleValue.includes(v)),
    [type, singleValue, multipleValue],
  );
  const toggle = useCallback(
    (v: string) => {
      if (type === 'single') {
        if (singleValue === v) {
          // Collapsing the currently-open single item is only allowed when
          // `collapsible` is true; otherwise we no-op so the open invariant
          // matches Radix's `collapsible=false` semantics.
          if (collapsible) setSingleValue('');
          return;
        }
        setSingleValue(v);
        return;
      }
      setMultipleValue(
        multipleValue.includes(v) ? multipleValue.filter((x) => x !== v) : [...multipleValue, v],
      );
    },
    [type, singleValue, multipleValue, collapsible, setSingleValue, setMultipleValue],
  );

  const ctxValue = useMemo<AccordionContextValue>(
    () => ({ type, collapsible, disabled, isOpen, toggle, registerTrigger, focusTrigger }),
    [type, collapsible, disabled, isOpen, toggle, registerTrigger, focusTrigger],
  );

  return (
    <AccordionCtx.Provider value={ctxValue}>
      <div
        ref={ref}
        data-variant={variant}
        className={cn(accordionRoot, accordionSize[size], className)}
        {...(rest as HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    </AccordionCtx.Provider>
  );
});

/** Props for {@link AccordionItem}. */
export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Identifier surfaced through the root's `onValueChange`. */
  value: string;
  /** Disable just this item. */
  disabled?: boolean;
}

/**
 * One collapsible row in the {@link Accordion}. Must be a direct child of
 * the root and supply a unique `value`.
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { className, value, disabled, ...rest },
  ref,
) {
  const ctx = useAccordionCtx();
  const idBase = useId();
  const open = ctx.isOpen(value);
  const itemDisabled = !!(disabled ?? ctx.disabled);
  const itemCtx = useMemo<AccordionItemContextValue>(
    () => ({
      value,
      triggerId: `${idBase}-trigger`,
      contentId: `${idBase}-content`,
      open,
      itemDisabled,
    }),
    [value, idBase, open, itemDisabled],
  );
  return (
    <AccordionItemCtx.Provider value={itemCtx}>
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        data-disabled={itemDisabled || undefined}
        className={cn(accordionItem, className)}
        {...rest}
      />
    </AccordionItemCtx.Provider>
  );
});

/** Props for the clickable header that toggles an {@link AccordionItem}. */
export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Hide the built-in chevron indicator. Useful when supplying a custom
   * indicator via `children`.
   * @default false
   */
  hideIndicator?: boolean;
}

/**
 * The clickable header that opens or closes its sibling
 * {@link AccordionContent}. Renders a chevron indicator that rotates on
 * expand.
 */
export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { className, children, hideIndicator, onClick, onKeyDown, ...rest },
    ref,
  ) {
    const accordion = useAccordionCtx();
    const item = useAccordionItemCtx();
    const localRef = useRef<HTMLButtonElement | null>(null);
    const setRefs = useMemo(
      () =>
        composeRefs<HTMLButtonElement>(ref, (node) => {
          localRef.current = node;
        }),
      [ref],
    );

    useEffect(
      () => accordion.registerTrigger(localRef.current, item.value),
      [accordion, item.value],
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (item.itemDisabled) return;
      accordion.toggle(item.value);
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          accordion.focusTrigger('next', event.currentTarget);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          accordion.focusTrigger('prev', event.currentTarget);
          break;
        case 'Home':
          event.preventDefault();
          accordion.focusTrigger('first', event.currentTarget);
          break;
        case 'End':
          event.preventDefault();
          accordion.focusTrigger('last', event.currentTarget);
          break;
      }
    };

    return (
      <h3 className={accordionHeader}>
        <button
          ref={setRefs}
          type="button"
          id={item.triggerId}
          aria-controls={item.contentId}
          aria-expanded={item.open}
          data-state={item.open ? 'open' : 'closed'}
          data-disabled={item.itemDisabled || undefined}
          disabled={item.itemDisabled}
          className={cn(accordionTrigger, className)}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          <span>{children}</span>
          {!hideIndicator ? <ChevronDownIcon className={accordionChevron} /> : null}
        </button>
      </h3>
    );
  },
);

/** Props for the expanding panel revealed by an {@link AccordionTrigger}. */
export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Keep the content mounted while closed (for in-panel state preservation). */
  forceMount?: boolean;
}

/**
 * The expandable panel beneath an {@link AccordionTrigger}. Animates
 * height via `--cynosure-accordion-content-height` (Radix's
 * `--radix-accordion-content-height` is mirrored for legacy CSS).
 */
export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, children, forceMount, style, ...rest }, ref) {
    const item = useAccordionItemCtx();
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
      if (typeof ResizeObserver === 'undefined') return undefined;
      const ro = new ResizeObserver(measure);
      ro.observe(innerRef.current);
      return () => ro.disconnect();
    }, [measure]);

    if (!forceMount && !item.open) return null;

    const heightVar = height ?? 0;
    return (
      <div
        ref={setRefs}
        id={item.contentId}
        role={REGION_ROLE}
        aria-labelledby={item.triggerId}
        data-state={item.open ? 'open' : 'closed'}
        className={cn(accordionContent, className)}
        style={
          {
            ...style,
            '--cynosure-accordion-content-height': `${heightVar}px`,
            '--radix-accordion-content-height': `${heightVar}px`,
          } as CSSProperties
        }
        {...rest}
      >
        <div className={accordionContentInner}>{children}</div>
      </div>
    );
  },
);
