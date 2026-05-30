import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useId } from '../../hooks/useId.js';
import { Portal } from '../../primitives/Portal.js';
import { Slot } from '../../primitives/Slot.js';
import { composeRefs } from '../../utils/composeRefs.js';
import {
  type FloatingAlign,
  type FloatingSide,
  useFloatingPosition,
} from './useFloatingPosition.js';

/*
 * First-party, headless menu engine. Replaces `@radix-ui/react-dropdown-menu`,
 * `@radix-ui/react-context-menu`, and `@radix-ui/react-menubar` with a single
 * in-tree implementation so the library carries no Radix runtime deps.
 *
 * The engine is deliberately DOM-driven for keyboard navigation: each open
 * surface (`Content`/`SubContent`) is a roving-focus group whose items are
 * discovered by querying `[role^="menuitem"]` within the surface node. Submenu
 * surfaces portal to `document.body`, so they never appear inside a parent
 * surface's query and navigation scopes itself for free.
 *
 * The exported `createMenuComponents(mode)` returns a Radix-shaped namespace
 * (`Root`, `Trigger`, `Content`, `Item`, …) so the existing `createMenuKit`
 * visual layer consumes it unchanged.
 */

type AnyProps = Record<string, unknown>;
type MenuMode = 'dropdown' | 'context' | 'menubar';
type FocusIntent = 'first' | 'last' | 'content';

const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';
const OVERLAY_SELECTOR = '[data-cynosure-overlay]';

const isPrintableKey = (key: string): boolean => key.length === 1 && !/\s/.test(key);

/** Enabled items that belong directly to `surface` (not a nested submenu). */
function getItems(surface: HTMLElement): HTMLElement[] {
  return Array.from(surface.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (el) => el.getAttribute('data-disabled') === null && el.closest('[role="menu"]') === surface,
  );
}

function setHighlight(surface: HTMLElement, target: HTMLElement | null): void {
  for (const item of getItems(surface)) {
    if (item === target) item.setAttribute('data-highlighted', '');
    else item.removeAttribute('data-highlighted');
  }
  if (target) target.focus({ preventScroll: true });
}

function moveHighlight(surface: HTMLElement, direction: 1 | -1): void {
  const items = getItems(surface);
  if (items.length === 0) return;
  const active = typeof document !== 'undefined' ? (document.activeElement as HTMLElement) : null;
  const current = active ? items.indexOf(active) : -1;
  let next = current === -1 ? (direction === 1 ? 0 : items.length - 1) : current + direction;
  if (next < 0) next = items.length - 1;
  if (next >= items.length) next = 0;
  setHighlight(surface, items[next] ?? null);
}

function typeahead(surface: HTMLElement, buffer: string): void {
  const items = getItems(surface);
  if (items.length === 0) return;
  const query = buffer.toLowerCase();
  const active = typeof document !== 'undefined' ? (document.activeElement as HTMLElement) : null;
  const start = active ? items.indexOf(active) : -1;
  // Search from the item after the current one, wrapping around, so repeated
  // presses of the same letter cycle through matches.
  const ordered = [...items.slice(start + 1), ...items.slice(0, start + 1)];
  const match = ordered.find((el) => (el.textContent ?? '').trim().toLowerCase().startsWith(query));
  if (match) setHighlight(surface, match);
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

interface MenuRootContextValue {
  mode: MenuMode;
  isSubmenu: boolean;
  open: boolean;
  /** Open the menu, optionally moving focus into it once mounted. */
  requestOpen: (intent?: FocusIntent) => void;
  /** Close the menu. `refocusTrigger` returns focus to the trigger element. */
  requestClose: (refocusTrigger?: boolean) => void;
  contentId: string;
  triggerId: string;
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  /** Pending focus target, read by `Content` on mount. */
  pendingFocusRef: React.MutableRefObject<FocusIntent | null>;
  /** Default placement for the surface (submenus open to the side). */
  defaultSide: FloatingSide;
  defaultAlign: FloatingAlign;
  /** Submenu only: focus the parent SubTrigger when the submenu closes. */
  parentRefocus?: () => void;
}

const MenuRootContext = createContext<MenuRootContextValue | null>(null);

function useMenuRoot(): MenuRootContextValue {
  const ctx = useContext(MenuRootContext);
  if (!ctx) throw new Error('Cynosure menu parts must be rendered inside a menu root.');
  return ctx;
}

interface RadioGroupContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
}
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/** Provides `checked` to a nested `ItemIndicator`. */
const ItemCheckedContext = createContext<boolean>(false);

// Coordinates sibling menus inside a `<Menubar>`.
interface MenubarContextValue {
  value: string | null;
  setValue: (value: string | null) => void;
  /** Currently focus-bearing trigger (roving tabindex owner). */
  focusedValue: string | null;
  setFocusedValue: (value: string) => void;
  /** The single trigger that participates in the page tab sequence. */
  tabbableValue: string | null;
  /** Move keyboard focus to the previous/next top-level trigger. */
  moveFocus: (from: string, direction: 1 | -1) => void;
  /** Close the open menu and open the adjacent one, focusing its first item. */
  moveOpen: (direction: 1 | -1) => void;
  registerTrigger: (value: string, el: HTMLElement | null) => void;
}
const MenubarContext = createContext<MenubarContextValue | null>(null);

/** Provides a `<MenubarMenu>`'s identity to its trigger. */
const MenubarMenuContext = createContext<{ value: string } | null>(null);

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface MenuRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dir?: 'ltr' | 'rtl';
  /** @internal */
  modal?: boolean;
  children?: ReactNode;
}

interface InternalRootProps extends MenuRootProps {
  mode: MenuMode;
  isSubmenu?: boolean;
  defaultSide?: FloatingSide;
  defaultAlign?: FloatingAlign;
  parentRefocus?: () => void;
}

function MenuRootProvider({
  mode,
  isSubmenu = false,
  open: openProp,
  defaultOpen,
  onOpenChange,
  defaultSide = 'bottom',
  defaultAlign = 'start',
  parentRefocus,
  children,
}: InternalRootProps) {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const triggerRef = useRef<HTMLElement | null>(null);
  const pendingFocusRef = useRef<FocusIntent | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const baseId = useId();
  const contentId = `${baseId}-content`;
  const triggerId = `${baseId}-trigger`;

  const requestOpen = useCallback(
    (intent: FocusIntent = 'content') => {
      pendingFocusRef.current = intent;
      setOpen(true);
    },
    [setOpen],
  );

  const requestClose = useCallback(
    (refocusTrigger = false) => {
      setOpen(false);
      if (refocusTrigger) {
        if (parentRefocus) parentRefocus();
        else triggerRef.current?.focus({ preventScroll: true });
      }
    },
    [setOpen, parentRefocus],
  );

  const value = useMemo<MenuRootContextValue>(
    () => ({
      mode,
      isSubmenu,
      open,
      requestOpen,
      requestClose,
      contentId,
      triggerId,
      anchorEl,
      setAnchorEl,
      triggerRef,
      pendingFocusRef,
      defaultSide,
      defaultAlign,
      parentRefocus,
    }),
    [
      mode,
      isSubmenu,
      open,
      requestOpen,
      requestClose,
      contentId,
      triggerId,
      anchorEl,
      defaultSide,
      defaultAlign,
      parentRefocus,
    ],
  );

  return <MenuRootContext.Provider value={value}>{children}</MenuRootContext.Provider>;
}

// ---------------------------------------------------------------------------
// Trigger (button mode — DropdownMenu)
// ---------------------------------------------------------------------------

export interface MenuTriggerProps extends ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
}

const ButtonTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(function ButtonTrigger(
  { asChild, onClick, onKeyDown, onPointerDown, ...rest },
  forwardedRef,
) {
  const root = useMenuRoot();
  const menubar = useContext(MenubarContext);
  const Comp = asChild ? Slot : 'button';

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      root.triggerRef.current = node;
      root.setAnchorEl(node);
    },
    [root],
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (root.open) root.requestClose(false);
    else root.requestOpen('content');
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      root.requestOpen('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      root.requestOpen('last');
    } else if (menubar && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      // Inside a menubar the top-level triggers navigate horizontally.
    }
  };

  return (
    <Comp
      {...(rest as AnyProps)}
      ref={composeRefs(forwardedRef as React.Ref<HTMLElement>, setRef)}
      type={asChild ? undefined : 'button'}
      id={root.triggerId}
      aria-haspopup="menu"
      aria-expanded={root.open}
      aria-controls={root.open ? root.contentId : undefined}
      data-state={root.open ? 'open' : 'closed'}
      onClick={handleClick as (e: React.MouseEvent<HTMLElement>) => void}
      onKeyDown={handleKeyDown as (e: ReactKeyboardEvent<HTMLElement>) => void}
      onPointerDown={onPointerDown as ((e: ReactPointerEvent<HTMLElement>) => void) | undefined}
    />
  );
});

// ---------------------------------------------------------------------------
// Trigger (context mode — right-click)
// ---------------------------------------------------------------------------

export interface ContextTriggerProps extends ComponentPropsWithoutRef<'span'> {
  disabled?: boolean;
}

const ContextTrigger = forwardRef<HTMLSpanElement, ContextTriggerProps>(function ContextTrigger(
  { disabled, onContextMenu, children, ...rest },
  forwardedRef,
) {
  const root = useMenuRoot();
  // A zero-size element placed at the pointer; the surface positions against it.
  const virtualRef = useRef<HTMLSpanElement | null>(null);

  const handleContextMenu = (event: React.MouseEvent<HTMLSpanElement>) => {
    onContextMenu?.(event);
    if (event.defaultPrevented || disabled) return;
    event.preventDefault();
    const virtual = virtualRef.current;
    if (virtual) {
      virtual.style.left = `${event.clientX}px`;
      virtual.style.top = `${event.clientY}px`;
      root.setAnchorEl(virtual);
    }
    root.requestOpen('content');
  };

  return (
    <>
      <span
        {...(rest as AnyProps)}
        ref={forwardedRef}
        data-cynosure-context-trigger=""
        style={{ display: 'contents', ...((rest as { style?: React.CSSProperties }).style ?? {}) }}
        onContextMenu={handleContextMenu}
      >
        {children}
      </span>
      <span
        ref={virtualRef}
        aria-hidden="true"
        style={{ position: 'fixed', width: 0, height: 0 }}
      />
    </>
  );
});

// ---------------------------------------------------------------------------
// Portal & Content
// ---------------------------------------------------------------------------

export interface MenuPortalProps {
  container?: Element | DocumentFragment | null;
  children?: ReactNode;
}

function MenuPortal({ container, children }: MenuPortalProps) {
  return <Portal container={container ?? undefined}>{children}</Portal>;
}

export interface MenuContentProps extends ComponentPropsWithoutRef<'div'> {
  side?: FloatingSide;
  align?: FloatingAlign;
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
  loop?: boolean;
  /** Accepted for Radix-API parity; ignored. */
  onCloseAutoFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

function useDismiss(root: MenuRootContextValue): void {
  useEffect(() => {
    if (!root.open || root.isSubmenu) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(OVERLAY_SELECTOR)) return;
      const trigger = root.triggerRef.current;
      if (trigger && (trigger === target || trigger.contains(target))) return;
      if (target.closest('[data-cynosure-context-trigger]')) return;
      root.requestClose(false);
    };
    // Defer so the same interaction that opened the menu doesn't close it.
    const id = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown, true);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [root]);
}

const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  {
    side,
    align,
    sideOffset = 4,
    alignOffset = 0,
    avoidCollisions = true,
    collisionPadding = 8,
    loop: _loop,
    onCloseAutoFocus: _onCloseAutoFocus,
    onEscapeKeyDown,
    onKeyDown,
    onPointerLeave,
    children,
    ...rest
  },
  forwardedRef,
) {
  const root = useMenuRoot();
  const menubar = useContext(MenubarContext);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const typeaheadRef = useRef<{ buffer: string; timer: number }>({ buffer: '', timer: 0 });

  const floating = useFloatingPosition({
    anchor: root.anchorEl,
    open: root.open,
    side: side ?? root.defaultSide,
    align: align ?? root.defaultAlign,
    sideOffset,
    alignOffset,
    avoidCollisions,
    collisionPadding,
  });

  useDismiss(root);

  // Move focus into the surface once it mounts, honoring the trigger's intent.
  useEffect(() => {
    if (!root.open) return;
    const surface = contentRef.current;
    if (!surface) return;
    const intent = root.pendingFocusRef.current ?? 'content';
    root.pendingFocusRef.current = null;
    const items = getItems(surface);
    if (intent === 'first' && items[0]) setHighlight(surface, items[0]);
    else if (intent === 'last' && items.length)
      setHighlight(surface, items[items.length - 1] ?? null);
    else surface.focus({ preventScroll: true });
  }, [root.open, root.pendingFocusRef]);

  if (!root.open) return null;

  const runTypeahead = (key: string) => {
    const surface = contentRef.current;
    if (!surface) return;
    const state = typeaheadRef.current;
    window.clearTimeout(state.timer);
    state.buffer += key;
    typeahead(surface, state.buffer);
    state.timer = window.setTimeout(() => {
      state.buffer = '';
    }, 500);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const surface = contentRef.current;
    if (!surface) return;
    const { key } = event;
    const active = document.activeElement as HTMLElement | null;

    if (key === 'ArrowDown') {
      event.preventDefault();
      moveHighlight(surface, 1);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      moveHighlight(surface, -1);
    } else if (key === 'Home') {
      event.preventDefault();
      const items = getItems(surface);
      if (items[0]) setHighlight(surface, items[0]);
    } else if (key === 'End') {
      event.preventDefault();
      const items = getItems(surface);
      if (items.length) setHighlight(surface, items[items.length - 1] ?? null);
    } else if (key === 'Escape') {
      event.preventDefault();
      onEscapeKeyDown?.(event.nativeEvent);
      root.requestClose(true);
    } else if (key === 'Tab') {
      // Radix dismisses the menu on Tab; let focus proceed naturally.
      root.requestClose(false);
    } else if (key === 'Enter' || key === ' ') {
      if (active?.closest(ITEM_SELECTOR)) {
        event.preventDefault();
        (active.closest(ITEM_SELECTOR) as HTMLElement | null)?.click();
      }
    } else if (key === 'ArrowLeft' && root.isSubmenu) {
      event.preventDefault();
      root.requestClose(true);
    } else if (
      (key === 'ArrowRight' || key === 'ArrowLeft') &&
      menubar &&
      root.mode === 'menubar' &&
      !root.isSubmenu
    ) {
      event.preventDefault();
      menubar.moveOpen(key === 'ArrowRight' ? 1 : -1);
    } else if (isPrintableKey(key)) {
      runTypeahead(key);
    }
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    const surface = contentRef.current;
    if (surface) setHighlight(surface, null);
  };

  return (
    <div
      {...(rest as AnyProps)}
      ref={composeRefs(forwardedRef, contentRef, floating.ref as React.Ref<HTMLDivElement>)}
      id={root.contentId}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
      data-state="open"
      data-side={floating.side}
      data-align={floating.align}
      style={{
        position: 'fixed',
        left: floating.x,
        top: floating.y,
        margin: 0,
        ...((rest as { style?: React.CSSProperties }).style ?? {}),
      }}
      onKeyDown={handleKeyDown}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

interface BaseItemProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  disabled?: boolean;
  /** Fired on activation. Call `preventDefault()` to keep the menu open. */
  onSelect?: (event: Event) => void;
}

function useItemBehavior(
  disabled: boolean | undefined,
  onSelect: ((event: Event) => void) | undefined,
  closeOnSelect: boolean,
) {
  const root = useMenuRoot();
  const select = useCallback(() => {
    if (disabled) return;
    const event = new Event('cynosure.menu.select', { cancelable: true, bubbles: false });
    onSelect?.(event);
    if (closeOnSelect && !event.defaultPrevented) root.requestClose(true);
  }, [disabled, onSelect, closeOnSelect, root]);

  const onPointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const surface = event.currentTarget.closest('[role="menu"]') as HTMLElement | null;
    if (surface) setHighlight(surface, event.currentTarget);
  };

  return { select, onPointerEnter };
}

const MenuItem = forwardRef<HTMLDivElement, BaseItemProps>(function MenuItem(
  { disabled, onSelect, onClick, onPointerEnter, children, ...rest },
  forwardedRef,
) {
  const { select, onPointerEnter: enter } = useItemBehavior(disabled, onSelect, true);
  return (
    <div
      {...(rest as AnyProps)}
      ref={forwardedRef}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? '' : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) select();
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        enter(event);
      }}
    >
      {children}
    </div>
  );
});

export interface MenuCheckboxItemProps extends BaseItemProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const MenuCheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  function MenuCheckboxItem(
    { checked = false, onCheckedChange, disabled, onClick, onPointerEnter, children, ...rest },
    forwardedRef,
  ) {
    const onSelect = useCallback(() => onCheckedChange?.(!checked), [checked, onCheckedChange]);
    const { select, onPointerEnter: enter } = useItemBehavior(disabled, onSelect, true);
    return (
      <ItemCheckedContext.Provider value={checked}>
        <div
          {...(rest as AnyProps)}
          ref={forwardedRef}
          role="menuitemcheckbox"
          tabIndex={-1}
          aria-checked={checked}
          aria-disabled={disabled || undefined}
          data-state={checked ? 'checked' : 'unchecked'}
          data-disabled={disabled ? '' : undefined}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) select();
          }}
          onPointerEnter={(event) => {
            onPointerEnter?.(event);
            enter(event);
          }}
        >
          {children}
        </div>
      </ItemCheckedContext.Provider>
    );
  },
);

export interface MenuRadioGroupProps extends ComponentPropsWithoutRef<'div'> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const MenuRadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupProps>(function MenuRadioGroup(
  { value, onValueChange, children, ...rest },
  forwardedRef,
) {
  const ctx = useMemo<RadioGroupContextValue>(
    () => ({ value, onValueChange: (next) => onValueChange?.(next) }),
    [value, onValueChange],
  );
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" is the correct ARIA pattern inside a menu — it groups radio items without <fieldset>'s form semantics.
    <div {...(rest as AnyProps)} ref={forwardedRef} role="group">
      <RadioGroupContext.Provider value={ctx}>{children}</RadioGroupContext.Provider>
    </div>
  );
});

export interface MenuRadioItemProps extends BaseItemProps {
  value: string;
}

const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(function MenuRadioItem(
  { value, disabled, onClick, onPointerEnter, children, ...rest },
  forwardedRef,
) {
  const group = useContext(RadioGroupContext);
  const checked = group?.value === value;
  const onSelect = useCallback(() => group?.onValueChange(value), [group, value]);
  const { select, onPointerEnter: enter } = useItemBehavior(disabled, onSelect, true);
  return (
    <ItemCheckedContext.Provider value={checked}>
      <div
        {...(rest as AnyProps)}
        ref={forwardedRef}
        role="menuitemradio"
        tabIndex={-1}
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        data-state={checked ? 'checked' : 'unchecked'}
        data-disabled={disabled ? '' : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) select();
        }}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          enter(event);
        }}
      >
        {children}
      </div>
    </ItemCheckedContext.Provider>
  );
});

function MenuItemIndicator({ children, ...rest }: ComponentPropsWithoutRef<'span'>) {
  const checked = useContext(ItemCheckedContext);
  if (!checked) return null;
  return <span {...rest}>{children}</span>;
}

const MenuLabel = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function MenuLabel(props, ref) {
    return <div {...props} ref={ref} />;
  },
);

const MenuSeparator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function MenuSeparator(props, ref) {
    return (
      // biome-ignore lint/a11y/useFocusableInteractive: a menu separator is a static, non-interactive divider — the ARIA `separator` role here is decorative, not a focusable control.
      <div {...props} ref={ref} role="separator" aria-orientation="horizontal" />
    );
  },
);

const MenuGroup = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function MenuGroup(props, ref) {
    return <div {...props} ref={ref} role="group" />;
  },
);

// ---------------------------------------------------------------------------
// Submenus
// ---------------------------------------------------------------------------

export interface MenuSubProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

function MenuSub({ open, defaultOpen, onOpenChange, children }: MenuSubProps) {
  const parent = useMenuRoot();
  // The submenu's own `triggerRef` (the SubTrigger) handles refocus-on-close,
  // so no parent linkage is needed here.
  return (
    <MenuRootProvider
      mode={parent.mode}
      isSubmenu
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      defaultSide="right"
      defaultAlign="start"
    >
      {children}
    </MenuRootProvider>
  );
}

const MenuSubTrigger = forwardRef<HTMLDivElement, BaseItemProps>(function MenuSubTrigger(
  { disabled, onClick, onKeyDown, onPointerEnter, children, ...rest },
  forwardedRef,
) {
  const sub = useMenuRoot();
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      sub.triggerRef.current = node;
      sub.setAnchorEl(node);
    },
    [sub],
  );

  return (
    <div
      {...(rest as AnyProps)}
      ref={composeRefs(forwardedRef, setRef)}
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="menu"
      aria-expanded={sub.open}
      aria-disabled={disabled || undefined}
      data-state={sub.open ? 'open' : 'closed'}
      data-disabled={disabled ? '' : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (disabled || event.defaultPrevented) return;
        if (sub.open) sub.requestClose(false);
        else sub.requestOpen('first');
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (disabled || event.defaultPrevented) return;
        if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          sub.requestOpen('first');
        }
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (disabled) return;
        const surface = event.currentTarget.closest('[role="menu"]') as HTMLElement | null;
        if (surface) setHighlight(surface, event.currentTarget);
        sub.requestOpen('content');
      }}
    >
      {children}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Namespace factory
// ---------------------------------------------------------------------------

export interface MenuComponents {
  Root: (props: MenuRootProps) => ReactNode;
  Trigger: typeof ButtonTrigger | typeof ContextTrigger;
  Portal: typeof MenuPortal;
  Group: typeof MenuGroup;
  Sub: typeof MenuSub;
  SubTrigger: typeof MenuSubTrigger;
  SubContent: typeof MenuContent;
  RadioGroup: typeof MenuRadioGroup;
  Content: typeof MenuContent;
  Item: typeof MenuItem;
  CheckboxItem: typeof MenuCheckboxItem;
  RadioItem: typeof MenuRadioItem;
  Label: typeof MenuLabel;
  Separator: typeof MenuSeparator;
  ItemIndicator: typeof MenuItemIndicator;
}

/**
 * Build a Radix-shaped menu namespace for a given trigger mode. `dropdown`
 * anchors to a button trigger; `context` opens at the pointer on right-click.
 */
export function createMenuComponents(mode: 'dropdown' | 'context'): MenuComponents {
  function Root(props: MenuRootProps) {
    return <MenuRootProvider mode={mode} {...props} />;
  }
  return {
    Root,
    Trigger: mode === 'context' ? ContextTrigger : ButtonTrigger,
    Portal: MenuPortal,
    Group: MenuGroup,
    Sub: MenuSub,
    SubTrigger: MenuSubTrigger,
    SubContent: MenuContent,
    RadioGroup: MenuRadioGroup,
    Content: MenuContent,
    Item: MenuItem,
    CheckboxItem: MenuCheckboxItem,
    RadioItem: MenuRadioItem,
    Label: MenuLabel,
    Separator: MenuSeparator,
    ItemIndicator: MenuItemIndicator,
  };
}

// Re-exported for the menubar layer, which reuses the surface + items but
// supplies its own coordinated root/trigger.
export {
  MenuRootProvider,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuItemIndicator,
  MenuLabel,
  MenuSeparator,
  MenuGroup,
  MenuSub,
  MenuSubTrigger,
  MenuPortal,
  ButtonTrigger,
  MenuRootContext,
  MenubarContext,
  MenubarMenuContext,
  useMenuRoot,
};
export type { MenubarContextValue };
