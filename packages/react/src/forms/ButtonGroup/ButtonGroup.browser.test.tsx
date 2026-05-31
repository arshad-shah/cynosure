import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Button } from '../Button/Button.js';
import { ButtonGroup } from './ButtonGroup.js';

/**
 * Real-browser test: the `attached` segmented layout collapses inter-button
 * gaps and overlaps borders, which only resolves with a real layout engine —
 * jsdom reports zeroed boxes. Here we assert the buttons sit on the same row
 * (equal `top`) and butt up against each other, plus that clicks still route
 * to the right button. Runs across Chromium/Firefox/WebKit in CI.
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
  // Attached: the next button starts where the previous ends (borders overlap).
  expect(Math.abs(weekRect.left - dayRect.right)).toBeLessThanOrEqual(2);

  fireEvent.click(screen.getByRole('button', { name: 'Month' }));
  expect(clicked).toEqual(['Month']);
});
