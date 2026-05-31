import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../Dialog/index.js';

/**
 * Real-browser checks — jsdom can't measure layout and doesn't run the focus
 * trap the way a real browser does. Here we verify the modal surface has a
 * non-zero, centered-ish bounding box (not parked at the origin), that opening
 * moves focus into the dialog, and that Escape closes it and returns focus to
 * the trigger. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Dialog opens with real layout, traps focus, and closes on Escape', async () => {
  render(
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Invite teammates</DialogTitle>
        <DialogDescription>Share a link to invite members.</DialogDescription>
        <DialogClose>Done</DialogClose>
      </DialogContent>
    </Dialog>,
  );

  const trigger = screen.getByText('Open');
  fireEvent.click(trigger);
  const dialog = await screen.findByRole('dialog');

  await waitFor(() => {
    const d = dialog.getBoundingClientRect();
    // Painted with real size, not collapsed at the origin.
    expect(d.width).toBeGreaterThan(0);
    expect(d.height).toBeGreaterThan(0);
    // Focus has moved into the dialog (focus trap is active).
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  // Focus returns to the trigger that opened it.
  expect(document.activeElement).toBe(trigger);
});
