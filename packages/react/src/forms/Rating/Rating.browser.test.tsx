import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { star } from './Rating.css.js';
import { Rating } from './Rating.js';

/**
 * Real-browser test: clicking a star maps a pointer position over a rendered
 * star box to a rating value, and the fill overlay is driven by layout-derived
 * geometry. Both need a real layout engine with non-zero element rects, which
 * jsdom lacks. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Rating sets its value to the clicked star', () => {
  let value = 0;
  const { container } = render(
    <Rating
      defaultValue={0}
      label="Score"
      onValueChange={(v) => {
        value = v;
      }}
    />,
  );
  const rating = screen.getByRole('slider', { name: 'Score' });
  const stars = container.querySelectorAll<HTMLElement>(`.${star}`);
  expect(stars.length).toBe(5);
  expect(stars[2].getBoundingClientRect().width).toBeGreaterThan(0);

  // Click the third star → rating becomes 3.
  fireEvent.click(stars[2]);
  expect(value).toBe(3);
  expect(rating).toHaveAttribute('aria-valuenow', '3');

  // Click the first star → rating becomes 1.
  fireEvent.click(stars[0]);
  expect(value).toBe(1);
  expect(rating).toHaveAttribute('aria-valuenow', '1');
});
