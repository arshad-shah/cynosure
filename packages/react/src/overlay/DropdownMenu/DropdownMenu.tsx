import { MenuTriggerButton } from '../shared/MenuTriggerButton.js';
import { type MenuNamespace, createMenuKit } from '../shared/createMenuKit.js';
import { createMenuComponents } from '../shared/menuEngine.js';

const Menu = createMenuComponents('dropdown');
const kit = createMenuKit(Menu as unknown as MenuNamespace);

/**
 * Trigger-button-anchored menu. Shares the visual contract with
 * `ContextMenu` and `MenuBar` via the shared kit; the trigger is a regular
 * button (or any element with `asChild`) instead of a right-click target.
 * The first-party menu engine manages focus, type-ahead, arrow-key
 * navigation, and `Escape`/outside-click dismissal.
 *
 * Compose with `DropdownMenuTrigger` (or the styled `DropdownMenuTriggerButton`),
 * `DropdownMenuContent`, and item primitives like `DropdownMenuItem`,
 * `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, and
 * `DropdownMenuSubTrigger` / `DropdownMenuSubContent` for nested menus.
 */
export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;
export const DropdownMenuTriggerButton = MenuTriggerButton;
export const DropdownMenuPortal = Menu.Portal;
export const DropdownMenuGroup = Menu.Group;
export const DropdownMenuSub = Menu.Sub;
export const DropdownMenuRadioGroup = Menu.RadioGroup;

export const DropdownMenuContent = kit.Content;
export const DropdownMenuSubContent = kit.SubContent;
export const DropdownMenuItem = kit.Item;
export const DropdownMenuCheckboxItem = kit.CheckboxItem;
export const DropdownMenuRadioItem = kit.RadioItem;
export const DropdownMenuSubTrigger = kit.SubTrigger;
export const DropdownMenuLabel = kit.Label;
export const DropdownMenuSeparator = kit.Separator;
export const DropdownMenuShortcut = kit.Shortcut;

export type {
  MenuContentProps as DropdownMenuContentProps,
  MenuItemProps as DropdownMenuItemProps,
} from '../shared/createMenuKit.js';
