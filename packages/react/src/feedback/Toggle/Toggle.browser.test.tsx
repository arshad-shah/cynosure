import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Toggle } from './Toggle.js';

/**
 * Real-browser test: the toggle is a real `<button>` whose pressed visual
 * relies on `:focus-visible` and a measurable hit target. Confirming it
 * focuses, renders a non-zero box, and flips `aria-pressed`/`data-state` on
 * click needs a real layout/focus engine. Runs across the Chromium/Firefox/
 * WebKit matrix in CI.
 */
test('Toggle flips aria-pressed on click and is focusable', () => {
  render(<Toggle aria-label="Bold">B</Toggle>);
  const toggle = screen.getByRole('button', { name: 'Bold' });

  expect(toggle.getBoundingClientRect().width).toBeGreaterThan(0);
  expect(toggle).toHaveAttribute('aria-pressed', 'false');

  toggle.focus();
  expect(toggle).toHaveFocus();

  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(toggle).toHaveAttribute('data-state', 'on');

  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-pressed', 'false');
});
