import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Slider } from './Slider.js';

/**
 * Real-browser test: the thumb is absolutely positioned along the track as a
 * percentage of the value, so verifying it physically slides right when the
 * value increases requires a real layout engine. jsdom returns zeroed boxes
 * and can't position the thumb. Runs across the Chromium/Firefox/WebKit matrix.
 */
test('Slider thumb moves right when ArrowRight increases the value', async () => {
  render(
    <div style={{ width: 360 }}>
      <Slider label="Volume" defaultValue={40} />
    </div>,
  );
  const thumb = screen.getByRole('slider');
  expect(thumb).toHaveAttribute('aria-valuenow', '40');
  const startLeft = thumb.getBoundingClientRect().left;

  thumb.focus();
  expect(thumb).toHaveFocus();
  // Several steps so the pixel movement clears the tolerance.
  for (let i = 0; i < 10; i++) {
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
  }

  await waitFor(() => {
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
    expect(thumb.getBoundingClientRect().left).toBeGreaterThan(startLeft + 2);
  });
});
