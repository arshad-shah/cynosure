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

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

const sizes: Size[] = ['xs', 'sm', 'md', 'lg', 'xl', 'full'];

export default function Example() {
  const [activeSize, setActiveSize] = useState<Size | null>(null);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {sizes.map((size) => (
        <Dialog
          key={size}
          open={activeSize === size}
          onOpenChange={(o) => setActiveSize(o ? size : null)}
        >
          <DialogTrigger asChild>
            <Button variant="outline">{size}</Button>
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>Size: {size}</DialogTitle>
              <DialogDescription>
                Dialog at the <strong>{size}</strong> size variant.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
