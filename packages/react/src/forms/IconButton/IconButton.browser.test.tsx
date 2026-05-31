import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { expect, test } from 'vitest';
import { IconButton } from './IconButton.js';

const Icon = (): ReactElement => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
  </svg>
);

/**
 * Real-browser test: an icon-only button must still present a measurable,
 * roughly square hit target and a focus ring — both depend on a real layout
 * engine that jsdom lacks. Runs across the Chromium/Firefox/WebKit matrix.
 */
test('IconButton exposes its label, is focusable, and has a square hit target', () => {
  let clicks = 0;
  render(<IconButton icon={<Icon />} label="Search" onClick={() => clicks++} />);
  const button = screen.getByRole('button', { name: 'Search' });

  const rect = button.getBoundingClientRect();
  expect(rect.width).toBeGreaterThan(0);
  // shape="square" default → roughly equal width/height.
  expect(Math.abs(rect.width - rect.height)).toBeLessThanOrEqual(2);

  button.focus();
  expect(button).toHaveFocus();

  fireEvent.click(button);
  expect(clicks).toBe(1);
});
