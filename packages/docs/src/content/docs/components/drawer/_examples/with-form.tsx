import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  Label,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>Invite teammate</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <DrawerHeader>
            <DrawerTitle>Invite a teammate</DrawerTitle>
            <DrawerDescription>
              They will receive an email to join your workspace.
            </DrawerDescription>
          </DrawerHeader>
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              padding: '0 1.25rem',
            }}
          >
            <div style={{ display: 'grid', gap: '0.375rem' }}>
              <Label htmlFor="drawer-name">Name</Label>
              <Input
                id="drawer-name"
                value={name}
                onChange={setName}
                placeholder="Alex Park"
                required
              />
            </div>
            <div style={{ display: 'grid', gap: '0.375rem' }}>
              <Label htmlFor="drawer-email">Email</Label>
              <Input
                id="drawer-email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="alex@cynosure.app"
                required
              />
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit">Send invite</Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
