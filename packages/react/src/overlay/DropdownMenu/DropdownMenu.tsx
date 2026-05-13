import * as Radix from '@radix-ui/react-dropdown-menu';
import { MenuTriggerButton } from '../shared/MenuTriggerButton.js';
import { type MenuNamespace, createMenuKit } from '../shared/createMenuKit.js';

const kit = createMenuKit(Radix as unknown as MenuNamespace);

/**
 * Trigger-button-anchored menu. Shares the visual contract with
 * `ContextMenu` and `MenuBar` via the shared kit; the trigger is a regular
 * button (or any element with `asChild`) instead of a right-click target.
 * Radix manages focus trapping, type-ahead, arrow-key navigation, and
 * `Escape`/outside-click dismissal.
 *
 * Compose with `DropdownMenuTrigger` (or the styled `DropdownMenuTriggerButton`),
 * `DropdownMenuContent`, and item primitives like `DropdownMenuItem`,
 * `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, and
 * `DropdownMenuSubTrigger` / `DropdownMenuSubContent` for nested menus.
 */
export const DropdownMenu = Radix.Root;
export const DropdownMenuTrigger = Radix.Trigger;
export const DropdownMenuTriggerButton = MenuTriggerButton;
export const DropdownMenuPortal = Radix.Portal;
export const DropdownMenuGroup = Radix.Group;
export const DropdownMenuSub = Radix.Sub;
export const DropdownMenuRadioGroup = Radix.RadioGroup;

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
