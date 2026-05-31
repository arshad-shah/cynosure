import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTriggerButton,
} from '../DropdownMenu/index.js';

/**
 * Real-browser positioning — jsdom returns zeroed `getBoundingClientRect`, so
 * the floating menu's placement (anchored just below its trigger rather than
 * parked at the origin) can only be verified with real layout. Also confirms
 * the menu opens on click and closes on Escape. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('DropdownMenu anchors its menu below the trigger and closes on Escape', async () => {
  render(
    <DropdownMenu>
      <DropdownMenuTriggerButton>Actions</DropdownMenuTriggerButton>
      <DropdownMenuContent sideOffset={4}>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );

  const trigger = screen.getByRole('button', { name: /Actions/ });
  fireEvent.click(trigger);
  const menu = await screen.findByRole('menu');

  await waitFor(() => {
    const m = menu.getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    expect(m.width).toBeGreaterThan(0);
    expect(m.height).toBeGreaterThan(0);
    // Opens below the trigger, not at the (0,0) origin.
    expect(m.top).toBeGreaterThanOrEqual(t.bottom - 2);
  });

  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
});
