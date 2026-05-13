import {
  Button,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandMenu,
  CommandSeparator,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <CommandMenu open={open} onOpenChange={setOpen}>
        <CommandInput />
        <CommandList>
          <CommandEmpty />
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => setOpen(false)}>New file</CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>Open file</CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>Save</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="System">
            <CommandItem onSelect={() => setOpen(false)}>Settings</CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>Sign out</CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </CommandMenu>
    </>
  );
}
