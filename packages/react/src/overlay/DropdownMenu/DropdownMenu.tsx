import * as Radix from '@radix-ui/react-dropdown-menu';
import { MenuTriggerButton } from '../shared/MenuTriggerButton.js';
import { type MenuNamespace, createMenuKit } from '../shared/createMenuKit.js';

const kit = createMenuKit(Radix as unknown as MenuNamespace);

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
