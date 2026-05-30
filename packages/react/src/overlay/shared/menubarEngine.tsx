import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useId } from '../../hooks/useId.js';
import { Slot } from '../../primitives/Slot.js';
import { composeRefs } from '../../utils/composeRefs.js';
import {
  MenuCheckboxItem,
  type MenuComponents,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuItemIndicator,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRootProvider,
  MenuSeparator,
  MenuSub,
  MenuSubTrigger,
  MenubarContext,
  type MenubarContextValue,
  MenubarMenuContext,
  useMenuRoot,
} from './menuEngine.js';

/*
 * Menubar coordination layer on top of the shared menu engine. The `<Menubar>`
 * owns which child menu is open and which trigger holds the roving tabindex;
 * each `<MenubarMenu>` is a menu root whose open state is bound to that shared
 * value, so opening one menu closes its siblings and arrow ←/→ walks between
 * them — the classic application menu-bar pattern.
 */

type AnyProps = Record<string, unknown>;

export interface MenubarRootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const MenubarRoot = forwardRef<HTMLDivElement, MenubarRootProps>(function MenubarRoot(
  { value: valueProp, defaultValue, onValueChange, children, ...rest },
  forwardedRef,
) {
  const [value, setValueState] = useControllableState<string | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: (next) => {
      if (next != null) onValueChange?.(next);
    },
  });
  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  // Registration order doubles as the visual left-to-right trigger order.
  const orderRef = useRef<string[]>([]);
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const setValue = useCallback(
    (next: string | null) => setValueState(next as string),
    [setValueState],
  );

  const registerTrigger = useCallback((triggerValue: string, el: HTMLElement | null) => {
    const order = orderRef.current;
    if (el) {
      elementsRef.current.set(triggerValue, el);
      if (!order.includes(triggerValue)) order.push(triggerValue);
    } else {
      elementsRef.current.delete(triggerValue);
      const idx = order.indexOf(triggerValue);
      if (idx !== -1) order.splice(idx, 1);
    }
  }, []);

  const adjacent = useCallback((from: string | null, direction: 1 | -1): string | null => {
    const order = orderRef.current;
    if (order.length === 0) return null;
    const current = from == null ? -1 : order.indexOf(from);
    let next = current + direction;
    if (next < 0) next = order.length - 1;
    if (next >= order.length) next = 0;
    return order[next] ?? null;
  }, []);

  const moveFocus = useCallback(
    (from: string, direction: 1 | -1) => {
      const next = adjacent(from, direction);
      if (next == null) return;
      setFocusedValue(next);
      elementsRef.current.get(next)?.focus();
    },
    [adjacent],
  );

  const moveOpen = useCallback(
    (direction: 1 | -1) => {
      const next = adjacent(value, direction);
      if (next == null) return;
      setFocusedValue(next);
      setValue(next);
    },
    [adjacent, value, setValue],
  );

  const ctx = useMemo<MenubarContextValue>(
    () => ({
      value,
      setValue,
      focusedValue,
      setFocusedValue: (v: string) => setFocusedValue(v),
      tabbableValue: focusedValue ?? orderRef.current[0] ?? null,
      moveFocus,
      moveOpen,
      registerTrigger,
    }),
    [value, setValue, focusedValue, moveFocus, moveOpen, registerTrigger],
  );

  return (
    <div {...(rest as AnyProps)} ref={forwardedRef} role="menubar" aria-orientation="horizontal">
      <MenubarContext.Provider value={ctx}>{children}</MenubarContext.Provider>
    </div>
  );
});

export interface MenubarMenuProps {
  value?: string;
  children?: ReactNode;
}

function MenubarMenu({ value: valueProp, children }: MenubarMenuProps) {
  const menubar = useContext(MenubarContext);
  const generatedId = useId();
  const value = valueProp ?? generatedId;
  const open = menubar?.value === value;

  const menuCtx = useMemo(() => ({ value }), [value]);

  return (
    <MenubarMenuContext.Provider value={menuCtx}>
      <MenuRootProvider
        mode="menubar"
        open={open}
        onOpenChange={(next) => {
          menubar?.setValue(next ? value : null);
        }}
        defaultSide="bottom"
        defaultAlign="start"
      >
        {children}
      </MenuRootProvider>
    </MenubarMenuContext.Provider>
  );
}

export interface MenubarTriggerProps extends ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
}

const MenubarTrigger = forwardRef<HTMLButtonElement, MenubarTriggerProps>(function MenubarTrigger(
  { asChild, onClick, onKeyDown, onPointerEnter, onFocus, ...rest },
  forwardedRef,
) {
  const root = useMenuRoot();
  const menubar = useContext(MenubarContext);
  const menu = useContext(MenubarMenuContext);
  const value = menu?.value ?? '';
  const Comp = asChild ? Slot : 'button';

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      root.triggerRef.current = node;
      root.setAnchorEl(node);
      menubar?.registerTrigger(value, node);
    },
    [root, menubar, value],
  );

  const tabbable = menubar?.tabbableValue === value;

  return (
    <Comp
      {...(rest as AnyProps)}
      ref={composeRefs(forwardedRef as React.Ref<HTMLElement>, setRef)}
      type={asChild ? undefined : 'button'}
      id={root.triggerId}
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={root.open}
      aria-controls={root.open ? root.contentId : undefined}
      data-state={root.open ? 'open' : 'closed'}
      tabIndex={tabbable ? 0 : -1}
      onFocus={(event: React.FocusEvent<HTMLElement>) => {
        (onFocus as ((e: React.FocusEvent<HTMLElement>) => void) | undefined)?.(event);
        menubar?.setFocusedValue(value);
      }}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        (onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined)?.(event);
        if (event.defaultPrevented) return;
        if (root.open) root.requestClose(false);
        else root.requestOpen('content');
      }}
      onKeyDown={(event: ReactKeyboardEvent<HTMLElement>) => {
        (onKeyDown as ((e: ReactKeyboardEvent<HTMLElement>) => void) | undefined)?.(event);
        if (event.defaultPrevented || !menubar) return;
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          menubar.moveFocus(value, 1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          menubar.moveFocus(value, -1);
        } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          root.requestOpen('first');
        }
      }}
      onPointerEnter={(event: React.PointerEvent<HTMLElement>) => {
        (onPointerEnter as ((e: React.PointerEvent<HTMLElement>) => void) | undefined)?.(event);
        if (!menubar) return;
        // Once any menu is open, hovering a sibling trigger switches to it.
        if (menubar.value != null && menubar.value !== value) {
          menubar.setValue(value);
          menubar.setFocusedValue(value);
        }
      }}
    />
  );
});

export interface MenubarComponents extends MenuComponents {
  Menu: typeof MenubarMenu;
}

/** Build the menubar namespace (coordinated root + per-menu parts). */
export function createMenubarComponents(): {
  Root: typeof MenubarRoot;
  Menu: typeof MenubarMenu;
  Trigger: typeof MenubarTrigger;
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
} {
  return {
    Root: MenubarRoot,
    Menu: MenubarMenu,
    Trigger: MenubarTrigger,
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
