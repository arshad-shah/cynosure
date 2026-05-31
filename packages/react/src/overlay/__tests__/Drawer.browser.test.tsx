import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '../Drawer/index.js';

/**
 * Real-browser checks — jsdom returns zeroed `getBoundingClientRect`, so we
 * can only verify the edge-anchored sliding panel actually paints flush
 * against the requested viewport edge (and isn't parked at the origin) with
 * real layout. We also confirm the focus trap moves focus into the panel and
 * that Escape closes it. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Drawer slides in flush against the right edge and closes on Escape', async () => {
  render(
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent side="right" size="md">
        <DrawerTitle>Notifications</DrawerTitle>
        <DrawerDescription>Recent activity.</DrawerDescription>
      </DrawerContent>
    </Drawer>,
  );

  fireEvent.click(screen.getByText('Open'));
  const drawer = await screen.findByRole('dialog');

  await waitFor(() => {
    const d = drawer.getBoundingClientRect();
    expect(d.width).toBeGreaterThan(0);
    expect(d.height).toBeGreaterThan(0);
    // Anchored to the right edge of the viewport.
    expect(Math.abs(d.right - window.innerWidth)).toBeLessThanOrEqual(2);
    // Focus has moved into the drawer (focus trap active).
    expect(drawer.contains(document.activeElement)).toBe(true);
  });

  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
