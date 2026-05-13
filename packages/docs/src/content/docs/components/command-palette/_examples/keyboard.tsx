import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandMenu,
  Kbd,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontSize: '0.875rem', margin: 0 }}>
        Press <Kbd>⌘</Kbd>
        <Kbd>K</Kbd> (or <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>) to toggle the palette.
      </p>
      <CommandMenu open={open} onOpenChange={setOpen}>
        <CommandInput />
        <CommandList>
          <CommandEmpty />
          <CommandGroup heading="Quick actions">
            <CommandItem onSelect={() => setOpen(false)}>New document</CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>Invite teammate</CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>Toggle theme</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandMenu>
    </div>
  );
}
