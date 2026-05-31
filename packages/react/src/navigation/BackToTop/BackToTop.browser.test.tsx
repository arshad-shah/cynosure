import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { BackToTop } from './BackToTop.js';

/**
 * Real-browser scroll check — `BackToTop` watches `window.scrollY` to reveal
 * itself and calls `window.scrollTo` to return to the top. jsdom never lays
 * out a scrollable document, so neither the scroll position nor the resulting
 * `scrollTo` effect can be observed there. This drives a real scrollable page
 * and asserts the visibility toggle plus the scroll-to-top behaviour. Runs
 * across the Chromium/Firefox/WebKit matrix in CI.
 */
test('BackToTop reveals past the threshold and scrolls to top on click', async () => {
  render(
    <div>
      {/* Tall content forces real document overflow so the window can scroll. */}
      <div style={{ height: '4000px' }}>spacer</div>
      <BackToTop showAfter={200} smooth={false} disablePortal />
    </div>,
  );

  const button = screen.getByRole('button', { name: 'Back to top' });
  expect(button).toHaveAttribute('data-visible', 'false');
  // The CSS hides the button while data-visible is false.
  expect(Number.parseFloat(getComputedStyle(button).opacity)).toBe(0);

  window.scrollTo(0, 600);
  fireEvent.scroll(window);
  await waitFor(() => {
    expect(button).toHaveAttribute('data-visible', 'true');
  });
  expect(Number.parseFloat(getComputedStyle(button).opacity)).toBe(1);
  expect(window.scrollY).toBeGreaterThan(200);

  fireEvent.click(button);
  await waitFor(() => {
    expect(window.scrollY).toBeLessThanOrEqual(2);
  });
});
