import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}
    >
      <p style={{ fontSize: '0.875rem', margin: 0 }}>
        open: <strong>{String(open)}</strong>
      </p>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle>Controlled drawer</DrawerTitle>
            <DrawerDescription>Its open state is owned by the parent component.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost">Close</Button>
            </DrawerClose>
            <Button onClick={() => setOpen(false)}>OK</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
