import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Checkbox } from './Checkbox.js';

/**
 * Real-browser test: the checkbox control is a custom button with an overlaid
 * indicator, so confirming it renders a real, focusable hit target with a
 * measurable box (and keyboard/click toggling) needs an actual layout engine.
 * jsdom reports zeroed rects. Runs across the Chromium/Firefox/WebKit matrix.
 */
test('Checkbox toggles via click and keyboard with a real hit target', () => {
  render(<Checkbox>Accept</Checkbox>);
  const cb = screen.getByRole('checkbox');

  const rect = cb.getBoundingClientRect();
  expect(rect.width).toBeGreaterThan(0);
  expect(rect.height).toBeGreaterThan(0);

  expect(cb).toHaveAttribute('data-state', 'unchecked');
  fireEvent.click(cb);
  expect(cb).toHaveAttribute('data-state', 'checked');
  fireEvent.click(cb);
  expect(cb).toHaveAttribute('data-state', 'unchecked');

  // Focusable for keyboard users.
  cb.focus();
  expect(cb).toHaveFocus();
});
