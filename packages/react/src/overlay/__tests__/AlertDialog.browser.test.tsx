import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../AlertDialog/index.js';

/**
 * Real-browser checks — jsdom can't measure layout. AlertDialog deliberately
 * suppresses Escape / outside-click, so we verify in a real browser that the
 * alertdialog paints with a real bounding box, that pressing Escape leaves it
 * open (the regression we guard against), and that only an explicit Cancel /
 * Action button closes it. Runs across the Chromium/Firefox/WebKit matrix.
 */
test('AlertDialog ignores Escape and closes only via Cancel', async () => {
  render(
    <AlertDialog>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete your account?</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Confirm</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>,
  );

  fireEvent.click(screen.getByText('Delete'));
  const dialog = await screen.findByRole('alertdialog');

  await waitFor(() => {
    const d = dialog.getBoundingClientRect();
    expect(d.width).toBeGreaterThan(0);
    expect(d.height).toBeGreaterThan(0);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  // Escape is suppressed — the alertdialog must remain mounted.
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Cancel'));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
});
