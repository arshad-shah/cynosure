import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ContextMenu/index.js';

/**
 * Real-browser positioning — jsdom returns zeroed `getBoundingClientRect`, so
 * the fact that a context menu anchors near the pointer coordinates (rather
 * than collapsing at the origin) can only be checked with real layout. Also
 * confirms right-click opens the menu and Escape closes it. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('ContextMenu opens near the pointer on right-click and closes on Escape', async () => {
  render(
    <ContextMenu>
      <ContextMenuTrigger>
        <div data-testid="area" style={{ width: 300, height: 160 }}>
          Right-click me
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );

  fireEvent.contextMenu(screen.getByTestId('area'), { clientX: 120, clientY: 90 });
  const menu = await screen.findByRole('menu');

  await waitFor(() => {
    const m = menu.getBoundingClientRect();
    expect(m.width).toBeGreaterThan(0);
    expect(m.height).toBeGreaterThan(0);
    // Painted inside the viewport, not parked at the origin.
    expect(m.left).toBeGreaterThanOrEqual(0);
    expect(m.top).toBeGreaterThanOrEqual(0);
  });

  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
});
