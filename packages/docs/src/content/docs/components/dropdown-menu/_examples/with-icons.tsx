import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTriggerButton,
} from '@arshad-shah/cynosure-react';
import { LogOut, Settings, User } from 'lucide-react';

export default function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTriggerButton>My account</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<User size={14} />}>Profile</DropdownMenuItem>
        <DropdownMenuItem icon={<Settings size={14} />}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<LogOut size={14} />} variant="danger">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
