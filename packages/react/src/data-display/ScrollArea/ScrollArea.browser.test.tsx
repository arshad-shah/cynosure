import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ScrollArea } from './ScrollArea.js';

/**
 * Real-browser scroll check — `ScrollArea` is a fixed-size overflow container,
 * so `scrollHeight`, `clientHeight` and `scrollTop` are all products of real
 * layout. jsdom reports these as 0 and never produces overflow, so actual
 * scrolling can only be verified in a real engine. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('ScrollArea overflows its content and scrolls vertically', async () => {
  render(
    <ScrollArea data-testid="scroller" height={150} width={300} scrollbars="vertical">
      <div>
        {Array.from({ length: 50 }, (_, i) => i).map((i) => (
          <p key={`row-${i.toString()}`} style={{ margin: 0, height: 24 }}>
            Row {i + 1}
          </p>
        ))}
      </div>
    </ScrollArea>,
  );

  const scroller = screen.getByTestId('scroller');
  // Content is taller than the viewport, so there is something to scroll.
  expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
  expect(scroller.clientHeight).toBeGreaterThan(0);
  expect(scroller.scrollTop).toBe(0);

  scroller.scrollTop = 200;
  fireEvent.scroll(scroller);

  await waitFor(() => {
    expect(scroller.scrollTop).toBeGreaterThan(0);
  });
  // Cannot scroll past the bottom.
  expect(scroller.scrollTop).toBeLessThanOrEqual(scroller.scrollHeight - scroller.clientHeight);
});
