import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../Dialog/index.js';

describe('Dialog', () => {
  function Harness({
    closeOnEscape,
    closeOnOverlayClick,
  }: {
    closeOnEscape?: boolean;
    closeOnOverlayClick?: boolean;
  } = {}) {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent closeOnEscape={closeOnEscape} closeOnOverlayClick={closeOnOverlayClick}>
          <DialogHeader>
            <DialogTitle>Delete workspace</DialogTitle>
            <DialogDescription>Cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  it('opens when the trigger is clicked and exposes dialog semantics', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('closes when the explicit Close button is clicked', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape by default', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    render(<Harness closeOnEscape={false} />);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders a built-in close button with the default label', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
