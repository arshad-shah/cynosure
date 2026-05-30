import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { type MenuNamespace, createMenuKit } from '../shared/createMenuKit.js';
import { menubarRoot, menubarTrigger } from '../shared/menu.css.js';
import {
  type MenubarRootProps,
  type MenubarTriggerProps,
  createMenubarComponents,
} from '../shared/menubarEngine.js';

const Menu = createMenubarComponents();
const kit = createMenuKit(Menu as unknown as MenuNamespace);

/**
 * Application-style menu bar. Keyboard: arrow ←/→ moves between top-level
 * menus, ↓ opens, Esc closes. All behaviour comes from the first-party menu
 * engine; item visuals come from the shared menu kit.
 */
export const MenuBarMenu = Menu.Menu;
export const MenuBarPortal = Menu.Portal;
export const MenuBarGroup = Menu.Group;
export const MenuBarSub = Menu.Sub;
export const MenuBarRadioGroup = Menu.RadioGroup;

/**
 * Top-level menu bar root. Renders the horizontal strip that hosts each
 * `MenuBarMenu`, with `role="menubar"` and roving-tab-index focus management.
 */
export const MenuBar = forwardRef<HTMLDivElement, MenubarRootProps>(function MenuBar(
  { className, ...rest },
  ref,
) {
  return <Menu.Root ref={ref} className={cn(menubarRoot, className)} {...rest} />;
});

/**
 * Top-level menu name (e.g. "File", "Edit"). Opens its menu on click,
 * `Enter`, `Space`, or `↓`; hover-opens once another top-level menu is
 * already open.
 */
export const MenuBarTrigger = forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  function MenuBarTrigger({ className, ...rest }, ref) {
    return <Menu.Trigger ref={ref} className={cn(menubarTrigger, className)} {...rest} />;
  },
);

export const MenuBarContent = kit.Content;
export const MenuBarSubContent = kit.SubContent;
export const MenuBarItem = kit.Item;
export const MenuBarCheckboxItem = kit.CheckboxItem;
export const MenuBarRadioItem = kit.RadioItem;
export const MenuBarSubTrigger = kit.SubTrigger;
export const MenuBarLabel = kit.Label;
export const MenuBarSeparator = kit.Separator;
export const MenuBarShortcut = kit.Shortcut;

export type { MenuContentProps as MenuBarContentProps } from '../shared/createMenuKit.js';
