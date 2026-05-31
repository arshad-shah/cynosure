import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/index.js';

/**
 * Real-browser positioning checks — jsdom returns zeroed `getBoundingClientRect`,
 * so the floating-element placement (and the regression where the entrance
 * keyframe's `transform` clobbered the inline offset and parked the surface at
 * the (0,0) origin) can only be verified with real layout. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('Popover anchors its content below the trigger, not at the origin', async () => {
  render(
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent sideOffset={8}>
        <div style={{ width: 200, height: 80 }}>Body</div>
      </PopoverContent>
    </Popover>,
  );
  fireEvent.click(screen.getByText('Open'));
  const dialog = await screen.findByRole('dialog');
  const trigger = screen.getByText('Open');

  await waitFor(() => {
    const d = dialog.getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    // Anchored just below the trigger by sideOffset — not parked at (0,0).
    expect(d.top).toBeGreaterThan(0);
    expect(Math.abs(d.top - (t.bottom + 8))).toBeLessThanOrEqual(2);
    // Collision shifting keeps it within the viewport's left edge.
    expect(d.left).toBeGreaterThanOrEqual(0);
  });
});

test('Popover places its content above the trigger for side="top"', async () => {
  render(
    // Push the trigger down so there is room above it (no collision flip).
    <div style={{ marginTop: 200 }}>
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent side="top" sideOffset={8}>
          <div style={{ width: 160, height: 60 }}>Body</div>
        </PopoverContent>
      </Popover>
    </div>,
  );
  fireEvent.click(screen.getByText('Open'));
  const dialog = await screen.findByRole('dialog');
  const trigger = screen.getByText('Open');

  await waitFor(() => {
    const d = dialog.getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    expect(Math.abs(d.bottom - (t.top - 8))).toBeLessThanOrEqual(2);
  });
});
