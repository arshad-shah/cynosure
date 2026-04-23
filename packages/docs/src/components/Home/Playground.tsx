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
  Input,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Playground() {
  const [value, setValue] = useState('');

  return (
    <section data-home-playground>
      <h2 data-section-heading>Try it live</h2>
      <div data-playground-grid>
        <div data-playground-cell>
          <Input
            value={value}
            onChange={(v) => setValue(v)}
            placeholder="Type something…"
            aria-label="Playground input"
          />
        </div>
        <div data-playground-cell>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hello from Cynosure</DialogTitle>
                <DialogDescription>
                  This dialog uses the real Cynosure Dialog component — no extra wrappers needed.
                </DialogDescription>
              </DialogHeader>
              <p style={{ margin: '0.75rem 0' }}>
                You typed: <strong>{value || '(nothing yet)'}</strong>
              </p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div data-playground-cell>
          <Button variant="outline" colorScheme="neutral" disabled>
            Disabled button
          </Button>
        </div>
      </div>
    </section>
  );
}
