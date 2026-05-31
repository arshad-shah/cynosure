import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { RangeSlider } from './RangeSlider.js';

/**
 * Real-browser test: each of the two thumbs is positioned along the track as a
 * percentage of its value, so verifying the start thumb physically slides right
 * (and the end thumb stays put) when the value changes needs a real layout
 * engine. jsdom returns zeroed boxes. Runs across the Chromium/Firefox/WebKit
 * matrix in CI.
 */
test('RangeSlider moves only the start thumb on ArrowRight', async () => {
  render(
    <div style={{ width: 420 }}>
      <RangeSlider label="Price" defaultValue={[25, 75]} />
    </div>,
  );
  const minThumb = screen.getByRole('slider', { name: 'Price (min)' });
  const maxThumb = screen.getByRole('slider', { name: 'Price (max)' });
  expect(minThumb).toHaveAttribute('aria-valuenow', '25');
  const startLeft = minThumb.getBoundingClientRect().left;
  const maxLeft = maxThumb.getBoundingClientRect().left;

  minThumb.focus();
  expect(minThumb).toHaveFocus();
  for (let i = 0; i < 10; i++) {
    fireEvent.keyDown(minThumb, { key: 'ArrowRight' });
  }

  await waitFor(() => {
    expect(minThumb).toHaveAttribute('aria-valuenow', '35');
    expect(minThumb.getBoundingClientRect().left).toBeGreaterThan(startLeft + 2);
    // The end thumb did not move.
    expect(Math.abs(maxThumb.getBoundingClientRect().left - maxLeft)).toBeLessThanOrEqual(2);
  });
});
