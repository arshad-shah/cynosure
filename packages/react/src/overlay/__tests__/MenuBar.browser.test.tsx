import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import {
  MenuBar,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarTrigger,
} from '../MenuBar/index.js';

/**
 * Real-browser positioning — jsdom returns zeroed `getBoundingClientRect`, so
 * we can only verify with real layout that an opened menu drops below its
 * menubar trigger (rather than collapsing at the origin). Also confirms the
 * menu opens on click and closes on Escape. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('MenuBar opens a menu beneath its trigger and closes on Escape', async () => {
  render(
    <div style={{ marginTop: 40 }}>
      <MenuBar>
        <MenuBarMenu>
          <MenuBarTrigger>File</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem>New</MenuBarItem>
            <MenuBarItem>Open</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
      </MenuBar>
    </div>,
  );

  const trigger = screen.getByRole('menuitem', { name: 'File' });
  fireEvent.click(trigger);
  const menu = await screen.findByRole('menu');

  await waitFor(() => {
    const m = menu.getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    expect(m.width).toBeGreaterThan(0);
    expect(m.height).toBeGreaterThan(0);
    // Drops below the trigger, not at the (0,0) origin.
    expect(m.top).toBeGreaterThanOrEqual(t.bottom - 2);
    expect(within(menu).getByRole('menuitem', { name: 'New' })).toBeInTheDocument();
  });

  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
});
