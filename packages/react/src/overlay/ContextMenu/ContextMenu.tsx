import * as Radix from '@radix-ui/react-context-menu';
import { type MenuNamespace, createMenuKit } from '../shared/createMenuKit.js';

const kit = createMenuKit(Radix as unknown as MenuNamespace);

/**
 * Right-click-triggered menu. Shares the visual contract with `DropdownMenu`
 * and `MenuBar` via the shared kit; the only behavioural difference is the
 * trigger event (`contextmenu`). Radix manages focus trapping, type-ahead,
 * arrow-key navigation, and `Escape`/outside-click dismissal.
 *
 * Compose with `ContextMenuTrigger` (the right-clickable area),
 * `ContextMenuContent` (the menu surface), and item primitives such as
 * `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, and
 * `ContextMenuSubTrigger` / `ContextMenuSubContent` for nested menus.
 */
export const ContextMenu = Radix.Root;
export const ContextMenuTrigger = Radix.Trigger;
export const ContextMenuPortal = Radix.Portal;
export const ContextMenuGroup = Radix.Group;
export const ContextMenuSub = Radix.Sub;
export const ContextMenuRadioGroup = Radix.RadioGroup;

export const ContextMenuContent = kit.Content;
export const ContextMenuSubContent = kit.SubContent;
export const ContextMenuItem = kit.Item;
export const ContextMenuCheckboxItem = kit.CheckboxItem;
export const ContextMenuRadioItem = kit.RadioItem;
export const ContextMenuSubTrigger = kit.SubTrigger;
export const ContextMenuLabel = kit.Label;
export const ContextMenuSeparator = kit.Separator;
export const ContextMenuShortcut = kit.Shortcut;

export type { MenuContentProps as ContextMenuContentProps } from '../shared/createMenuKit.js';
