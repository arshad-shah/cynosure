import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { PinInput } from './PinInput.js';

/**
 * PinInput is an inline-flex row of fixed-size cells separated by a gap. jsdom
 * zeroes `getBoundingClientRect`, so the real cell sizing and left-to-right
 * ordering can only be verified with real layout. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('PinInput lays its cells out in a row with real dimensions', async () => {
  render(<PinInput length={4} aria-label="Code" />);

  const cells = [1, 2, 3, 4].map((n) => screen.getByRole('textbox', { name: `Code digit ${n}` }));

  await expect.poll(() => cells[0]?.getBoundingClientRect().width ?? 0).toBeGreaterThan(0);

  const rects = cells.map((c) => c.getBoundingClientRect());
  // Square-ish cells with real size.
  for (const r of rects) {
    expect(r.width).toBeGreaterThan(0);
    expect(r.height).toBeGreaterThan(0);
  }
  // Each cell starts to the right of the previous one (left-to-right row).
  for (let i = 1; i < rects.length; i++) {
    expect((rects[i] as DOMRect).left).toBeGreaterThan((rects[i - 1] as DOMRect).left);
  }
});

test('PinInput fills successive cells as digits are typed in a real browser', async () => {
  render(<PinInput length={4} aria-label="Code" />);
  const first = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code digit 1' });
  const second = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code digit 2' });

  fireEvent.change(first, { target: { value: '1' } });
  await waitFor(() => expect(first.value).toBe('1'));
  fireEvent.change(second, { target: { value: '2' } });
  await waitFor(() => expect(second.value).toBe('2'));
});
