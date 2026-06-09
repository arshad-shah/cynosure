import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Button } from '../Button/Button.js';
import { ButtonGroup } from './ButtonGroup.js';

/**
 * Real-browser test: the `attached` segmented layout places the buttons as
 * tiles inside a padded track with a small fixed gap, which only resolves
 * with a real layout engine — jsdom reports zeroed boxes. Here we assert the
 * buttons sit on the same row (equal `top`) and are separated by the track's
 * segment gap, plus that clicks still route to the right button. Runs across
 * Chromium/Firefox/WebKit in CI.
 */
test('attached ButtonGroup lays its buttons on a single row and routes clicks', () => {
  const clicked: string[] = [];
  render(
    <ButtonGroup attached aria-label="View">
      <Button onClick={() => clicked.push('Day')}>Day</Button>
      <Button onClick={() => clicked.push('Week')}>Week</Button>
      <Button onClick={() => clicked.push('Month')}>Month</Button>
    </ButtonGroup>,
  );

  const day = screen.getByRole('button', { name: 'Day' });
  const week = screen.getByRole('button', { name: 'Week' });
  const dayRect = day.getBoundingClientRect();
  const weekRect = week.getBoundingClientRect();

  // Same row.
  expect(Math.abs(dayRect.top - weekRect.top)).toBeLessThanOrEqual(2);
  // Segmented track: the next tile starts a small gap (4px) after the previous.
  const gap = weekRect.left - dayRect.right;
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThanOrEqual(8);

  fireEvent.click(screen.getByRole('button', { name: 'Month' }));
  expect(clicked).toEqual(['Month']);
});
