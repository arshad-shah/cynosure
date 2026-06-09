import { ChevronDownIcon } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
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

export type AccordionVariant = 'default' | 'contained' | 'ghost';
export type AccordionSize = 'sm' | 'md' | 'lg';

type SingleProps = {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
};

type MultipleProps = {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
};

type RootBaseProps = Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onChange'> & {
  disabled?: boolean;
  /**
   * Visual treatment. `default` shows divider lines, `contained` renders each
   * item as a separate bordered card, `ghost` removes all chrome.
   * @default "default"
   */
  variant?: AccordionVariant;
  /**
   * Controls trigger padding, font size, and chevron size.
   * @default "md"
   */
  size?: AccordionSize;
};

/** Props for the {@link Accordion} root in either `single` or `multiple` mode. */
export type AccordionProps = RootBaseProps & (SingleProps | MultipleProps);

type AccordionContextValue = {
  baseId: string;
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  disabled: boolean;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
  focusSibling: (fromValue: string, direction: 'next' | 'prev' | 'first' | 'last') => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(component: string): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <Accordion>.`);
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

/**
 * Accordion is a vertically stacked set of headers that each reveal a panel.
 * Use `type="single"` for one-open-at-a-time behaviour or `type="multiple"`
 * to allow independent panels. Keyboard navigation (Up/Down/Home/End) and
 * `aria-expanded` state are handled internally.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const { variant = 'default', size = 'md', className, disabled = false, ...rest } = props;
  const baseId = useId();

  const isSingle = props.type === 'single';

  const [singleValue, setSingleValue] = useControllableState<string>(
    isSingle ? (props as SingleProps).value : undefined,
    isSingle ? ((props as SingleProps).defaultValue ?? '') : '',
    isSingle ? (props as SingleProps).onValueChange : undefined,
  );
  const [multiValue, setMultiValue] = useControllableState<string[]>(
    !isSingle ? (props as MultipleProps).value : undefined,
    !isSingle ? ((props as MultipleProps).defaultValue ?? []) : [],
    !isSingle ? (props as MultipleProps).onValueChange : undefined,
  );

  const collapsible = isSingle ? ((props as SingleProps).collapsible ?? false) : true;

  const isOpen = useCallback(
    (v: string) => (isSingle ? singleValue === v : multiValue.includes(v)),
    [isSingle, singleValue, multiValue],
  );

  const toggle = useCallback(
    (v: string) => {
      if (isSingle) {
        if (singleValue === v) {
          if (collapsible) setSingleValue('');
        } else {
          setSingleValue(v);
        }
      } else {
        setMultiValue(
          multiValue.includes(v) ? multiValue.filter((x) => x !== v) : [...multiValue, v],
        );
      }
    },
    [isSingle, singleValue, multiValue, collapsible, setSingleValue, setMultiValue],
  );

  const triggersRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const orderRef = useRef<string[]>([]);

  const registerTrigger = useCallback((value: string, el: HTMLButtonElement | null) => {
    const map = triggersRef.current;
    if (el) {
      map.set(value, el);
      if (!orderRef.current.includes(value)) orderRef.current.push(value);
    } else {
      map.delete(value);
      orderRef.current = orderRef.current.filter((v) => v !== value);
    }
  }, []);

  const focusSibling = useCallback(
    (fromValue: string, direction: 'next' | 'prev' | 'first' | 'last') => {
      const order = orderRef.current.filter((v) => {
        const el = triggersRef.current.get(v);
        return el && !el.disabled;
      });
      if (order.length === 0) return;
      const i = order.indexOf(fromValue);
      let target: string | undefined;
      if (direction === 'first') target = order[0];
      else if (direction === 'last') target = order[order.length - 1];
      else if (direction === 'next') target = order[(i + 1) % order.length];
      else target = order[(i - 1 + order.length) % order.length];
      if (target) triggersRef.current.get(target)?.focus();
    },
    [],
  );

  const ctx = useMemo<AccordionContextValue>(
    () => ({ baseId, isOpen, toggle, disabled, registerTrigger, focusSibling }),
    [baseId, isOpen, toggle, disabled, registerTrigger, focusSibling],
  );

  const restAsAny = rest as Record<string, unknown>;
  const {
    type: _type,
    value: _v,
    defaultValue: _dv,
    onValueChange: _ovc,
    collapsible: _c,
    ...domRest
  } = restAsAny;

  return (
    <AccordionContext.Provider value={ctx}>
      <div
        ref={ref}
        data-variant={variant}
        className={cn(accordionRoot, accordionSize[size], className)}
        {...domRest}
      />
    </AccordionContext.Provider>
  );
});

type ItemContextValue = {
  value: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
};

const ItemContext = createContext<ItemContextValue | null>(null);

function useItemContext(component: string): ItemContextValue {
  const ctx = useContext(ItemContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <AccordionItem>.`);
  }
  return ctx;
}

/** Props for a single collapsible row inside the {@link Accordion}. */
export interface AccordionItemProps extends ComponentPropsWithoutRef<'div'> {
  value: string;
  disabled?: boolean;
}

/**
 * One collapsible row in the {@link Accordion}. Must be a direct child of the
 * root and supply a unique `value`.
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { className, value, disabled = false, ...rest },
  ref,
) {
  const root = useAccordionContext('AccordionItem');
  const open = root.isOpen(value);
  const isDisabled = disabled || root.disabled;
  const triggerId = `${root.baseId}-${value}-trigger`;
  const contentId = `${root.baseId}-${value}-content`;

  const itemCtx = useMemo<ItemContextValue>(
    () => ({ value, open, disabled: isDisabled, triggerId, contentId }),
    [value, open, isDisabled, triggerId, contentId],
  );

  return (
    <ItemContext.Provider value={itemCtx}>
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        data-disabled={isDisabled ? '' : undefined}
        className={cn(accordionItem, className)}
        {...rest}
      />
    </ItemContext.Provider>
  );
});

/** Props for the clickable header that toggles an {@link AccordionItem}. */
export interface AccordionTriggerProps extends ComponentPropsWithoutRef<'button'> {
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
 * expand; pair with `hideIndicator` to provide a custom one.
 */
export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { className, children, hideIndicator, onClick, onKeyDown, ...rest },
    ref,
  ) {
    const root = useAccordionContext('AccordionTrigger');
    const item = useItemContext('AccordionTrigger');
    const localRef = useRef<HTMLButtonElement | null>(null);

    const setRef = useCallback(
      (el: HTMLButtonElement | null) => {
        localRef.current = el;
        root.registerTrigger(item.value, el);
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as { current: HTMLButtonElement | null }).current = el;
      },
      [ref, root, item.value],
    );

    useEffect(() => {
      return () => {
        root.registerTrigger(item.value, null);
      };
    }, [root, item.value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          root.focusSibling(item.value, 'next');
          break;
        case 'ArrowUp':
          e.preventDefault();
          root.focusSibling(item.value, 'prev');
          break;
        case 'Home':
          e.preventDefault();
          root.focusSibling(item.value, 'first');
          break;
        case 'End':
          e.preventDefault();
          root.focusSibling(item.value, 'last');
          break;
      }
    };

    return (
      <h3 className={accordionHeader}>
        <button
          ref={setRef}
          type="button"
          id={item.triggerId}
          aria-expanded={item.open}
          aria-controls={item.contentId}
          disabled={item.disabled}
          data-state={item.open ? 'open' : 'closed'}
          data-disabled={item.disabled ? '' : undefined}
          className={cn(accordionTrigger, className)}
          onClick={(e) => {
            onClick?.(e);
            if (e.defaultPrevented) return;
            if (!item.disabled) root.toggle(item.value);
          }}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          <span>{children}</span>
          {!hideIndicator ? (
            <ChevronDownIcon data-slot="chevron" className={accordionChevron} aria-hidden />
          ) : null}
        </button>
      </h3>
    );
  },
);

/** Props for the expanding panel revealed by an {@link AccordionTrigger}. */
export interface AccordionContentProps extends ComponentPropsWithoutRef<'section'> {}

/**
 * The expandable panel beneath an {@link AccordionTrigger}. Animates its
 * height open/close using a measured `scrollHeight` and a CSS height
 * transition; respects `prefers-reduced-motion`.
 */
export const AccordionContent = forwardRef<HTMLElement, AccordionContentProps>(
  function AccordionContent({ className, children, style, ...rest }, ref) {
    const item = useItemContext('AccordionContent');
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState<number | 'auto' | undefined>(item.open ? 'auto' : 0);
    const firstRender = useRef(true);

    useLayoutEffect(() => {
      const inner = innerRef.current;
      if (!inner) return;
      const measured = inner.scrollHeight;

      if (firstRender.current) {
        firstRender.current = false;
        setHeight(item.open ? 'auto' : 0);
        return;
      }

      if (item.open) {
        setHeight(0);
        requestAnimationFrame(() => {
          setHeight(measured);
        });
      } else {
        setHeight(measured);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
    }, [item.open]);

    const handleTransitionEnd = (e: React.TransitionEvent<HTMLElement>) => {
      if (e.propertyName !== 'height') return;
      if (item.open) setHeight('auto');
    };

    const setOuterRef = (el: HTMLElement | null) => {
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as { current: HTMLElement | null }).current = el;
    };

    return (
      <section
        ref={setOuterRef}
        id={item.contentId}
        aria-labelledby={item.triggerId}
        data-state={item.open ? 'open' : 'closed'}
        hidden={!item.open && height === 0}
        className={cn(accordionContent, className)}
        style={{ height: height === 'auto' ? undefined : height, ...style }}
        onTransitionEnd={handleTransitionEnd}
        {...rest}
      >
        <div ref={innerRef} className={accordionContentInner}>
          {children}
        </div>
      </section>
    );
  },
);
