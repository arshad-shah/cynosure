import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  function handleConfirm() {
    setDeleted(true);
    setOpen(false);
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="solid" colorScheme="danger">
            Delete account
          </Button>
        </DialogTrigger>
        <DialogContent closeOnOverlayClick={false} size="sm">
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will be erased.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button variant="solid" colorScheme="danger" onClick={handleConfirm}>
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {deleted && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-fg-danger, #dc2626)', margin: 0 }}>
          Account deleted.
        </p>
      )}
    </div>
  );
}
