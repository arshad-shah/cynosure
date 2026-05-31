import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Radio } from '../Radio/Radio.js';
import { RadioGroup } from './RadioGroup.js';

/**
 * Real-browser test: a horizontal radio group relies on real layout (items on
 * the same row, advancing rightward) and a focus engine for roving-tabindex
 * arrow navigation. jsdom can verify neither geometry nor focus reliably, so
 * this runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('horizontal RadioGroup lays items in a row and ArrowRight advances selection', () => {
  render(
    <RadioGroup defaultValue="free" orientation="horizontal" aria-label="Plan">
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team">Team</Radio>
    </RadioGroup>,
  );

  const free = screen.getByRole('radio', { name: 'Free' });
  const pro = screen.getByRole('radio', { name: 'Pro' });
  const freeRect = free.getBoundingClientRect();
  const proRect = pro.getBoundingClientRect();

  // Same row, Pro to the right of Free.
  expect(Math.abs(freeRect.top - proRect.top)).toBeLessThanOrEqual(2);
  expect(proRect.left).toBeGreaterThan(freeRect.left);

  free.focus();
  expect(free).toHaveFocus();
  fireEvent.keyDown(free, { key: 'ArrowRight' });
  expect(pro).toHaveAttribute('aria-checked', 'true');
  expect(pro).toHaveFocus();
});
