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
      <Button onClick={() => setOpen(true)}>Open palette</Button>
      <CommandMenu open={open} onOpenChange={setOpen}>
        <CommandInput />
        <CommandList>
          <CommandEmpty />
          <CommandGroup heading="File">
            <CommandItem shortcut="⌘N" onSelect={() => setOpen(false)}>
              New file
            </CommandItem>
            <CommandItem shortcut="⌘O" onSelect={() => setOpen(false)}>
              Open file
            </CommandItem>
            <CommandItem shortcut="⌘S" onSelect={() => setOpen(false)}>
              Save
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Edit">
            <CommandItem shortcut="⌘Z" onSelect={() => setOpen(false)}>
              Undo
            </CommandItem>
            <CommandItem shortcut="⇧⌘Z" onSelect={() => setOpen(false)}>
              Redo
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </CommandMenu>
    </>
  );
}
