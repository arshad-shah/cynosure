import { type MenuNamespace, createMenuKit } from '../shared/createMenuKit.js';
import { createMenuComponents } from '../shared/menuEngine.js';

const Menu = createMenuComponents('context');
const kit = createMenuKit(Menu as unknown as MenuNamespace);

/**
 * Right-click-triggered menu. Shares the visual contract with `DropdownMenu`
 * and `MenuBar` via the shared kit; the only behavioural difference is the
 * trigger event (`contextmenu`) and that the surface opens at the pointer.
 * The first-party menu engine manages focus, type-ahead, arrow-key
 * navigation, and `Escape`/outside-click dismissal.
 *
 * Compose with `ContextMenuTrigger` (the right-clickable area),
 * `ContextMenuContent` (the menu surface), and item primitives such as
 * `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, and
 * `ContextMenuSubTrigger` / `ContextMenuSubContent` for nested menus.
 */
export const ContextMenu = Menu.Root;
export const ContextMenuTrigger = Menu.Trigger;
export const ContextMenuPortal = Menu.Portal;
export const ContextMenuGroup = Menu.Group;
export const ContextMenuSub = Menu.Sub;
export const ContextMenuRadioGroup = Menu.RadioGroup;

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
