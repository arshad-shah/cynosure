import * as Radix from '@radix-ui/react-menubar';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { type MenuNamespace, createMenuKit } from '../shared/createMenuKit.js';
import { menubarRoot, menubarTrigger } from '../shared/menu.css.js';

const kit = createMenuKit(Radix as unknown as MenuNamespace);

/**
 * Application-style menu bar. Keyboard: arrow ←/→ moves between top-level
 * menus, ↓ opens, Esc closes. All semantics come from Radix; item visuals
 * come from the shared menu kit.
 */
// Re-export Radix's compound parts. Explicit type annotations keep TypeScript
// from inlining a non-portable path to the internal `react-context` module.
export const MenuBarMenu: typeof Radix.Menu = Radix.Menu;
export const MenuBarPortal: typeof Radix.Portal = Radix.Portal;
export const MenuBarGroup: typeof Radix.Group = Radix.Group;
export const MenuBarSub: typeof Radix.Sub = Radix.Sub;
export const MenuBarRadioGroup: typeof Radix.RadioGroup = Radix.RadioGroup;

/**
 * Top-level menu bar root. Renders the horizontal strip that hosts each
 * `MenuBarMenu`. ARIA role and roving-tab-index focus management come from
 * Radix.
 */
export const MenuBar = forwardRef<
  ElementRef<typeof Radix.Root>,
  ComponentPropsWithoutRef<typeof Radix.Root>
>(function MenuBar({ className, ...rest }, ref) {
  return <Radix.Root ref={ref} className={cn(menubarRoot, className)} {...rest} />;
});

/**
 * Top-level menu name (e.g. "File", "Edit"). Opens its menu on click,
 * `Enter`, `Space`, or `↓`; hover-opens once another top-level menu is
 * already open.
 */
export const MenuBarTrigger = forwardRef<
  ElementRef<typeof Radix.Trigger>,
  ComponentPropsWithoutRef<typeof Radix.Trigger>
>(function MenuBarTrigger({ className, ...rest }, ref) {
  return <Radix.Trigger ref={ref} className={cn(menubarTrigger, className)} {...rest} />;
});

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
