import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '../Drawer/index.js';

describe('Drawer', () => {
  function Harness({ side }: { side?: 'top' | 'right' | 'bottom' | 'left' } = {}) {
    const [open, setOpen] = useState(false);
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger>Open drawer</DrawerTrigger>
        <DrawerContent side={side}>
          <DrawerTitle>Settings</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
  }

  it('opens, exposes dialog role, tags data-side', () => {
    render(<Harness side="left" />);
    fireEvent.click(screen.getByText('Open drawer'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute('data-side')).toBe('left');
  });

  it('Sheet aliases expose the same component', () => {
    expect(Sheet).toBe(Drawer);
    expect(SheetContent).toBe(DrawerContent);
    expect(SheetTitle).toBe(DrawerTitle);
    expect(SheetTrigger).toBe(DrawerTrigger);
  });
});
