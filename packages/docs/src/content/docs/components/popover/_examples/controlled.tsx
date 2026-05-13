import {
  Button,
  Input,
  Label,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Untitled document');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>Rename</Button>
      </PopoverTrigger>
      <PopoverContent>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gap: '0.75rem', minWidth: '16rem' }}
        >
          <div style={{ display: 'grid', gap: '0.375rem' }}>
            <Label htmlFor="popover-name">Document name</Label>
            <Input id="popover-name" value={name} onChange={setName} autoFocus />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <PopoverClose asChild>
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </PopoverClose>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
