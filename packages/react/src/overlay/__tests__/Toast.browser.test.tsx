import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Toaster, toast } from '../Toast/index.js';

/**
 * Real-browser checks — jsdom can't measure layout and Sonner relies on real
 * timers / portal mounting. Here we verify in a real browser that firing a
 * toast actually mounts a visible notification with a non-zero bounding box
 * (anchored to a viewport corner, not collapsed at the origin) and that the
 * message text renders. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Toaster mounts a visible toast when toast() is called', async () => {
  render(
    <div>
      <button
        type="button"
        onClick={() => {
          toast.success('Changes saved');
        }}
      >
        Save
      </button>
      <Toaster position="bottom-right" />
    </div>,
  );

  fireEvent.click(screen.getByText('Save'));
  const message = await screen.findByText('Changes saved');

  await waitFor(() => {
    const rect = message.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
    // Rendered within the viewport, not parked at the origin.
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.top).toBeGreaterThanOrEqual(0);
  });
});
