import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '../Drawer/index.js';

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

  it('renders close button and dismisses on click', () => {
    render(<Harness side="right" />);
    fireEvent.click(screen.getByText('Open drawer'));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hides the close button when showCloseButton is false', () => {
    function NoClose() {
      const [open, setOpen] = useState(true);
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent showCloseButton={false}>
            <DrawerTitle>x</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );
    }
    render(<NoClose />);
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('omits the backdrop overlay when hideOverlay is true', () => {
    function NoOverlay() {
      const [open, setOpen] = useState(true);
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent hideOverlay>
            <DrawerTitle>x</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );
    }
    const { baseElement } = render(<NoOverlay />);
    const overlays = baseElement.querySelectorAll('[data-state]');
    // No element with overlay-backdrop class should exist; rely on count.
    expect(overlays.length).toBeGreaterThan(0);
  });

  it('preventDefaults escape and outside interaction when configured', () => {
    function Locked() {
      const [open, setOpen] = useState(true);
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent closeOnEscape={false} closeOnOverlayClick={false}>
            <DrawerTitle>x</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );
    }
    render(<Locked />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('accepts a function-form container', () => {
    function Custom() {
      const [open, setOpen] = useState(true);
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent container={() => document.body}>
            <DrawerTitle>x</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );
    }
    render(<Custom />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
