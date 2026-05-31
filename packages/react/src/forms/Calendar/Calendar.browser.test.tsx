import { parseDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { Calendar } from './Calendar.js';

/**
 * Real-browser focus-management check — the calendar grid uses a roving
 * tabindex and arrow-key navigation that moves the real
 * `document.activeElement` between day cells. jsdom only approximates focus and
 * does not honour the grid's real geometry, so keyboard traversal across days
 * is best verified in a real engine. Runs across the Chromium/Firefox/WebKit
 * matrix in CI.
 */
test('Calendar moves day focus with the arrow keys', async () => {
  render(<Calendar aria-label="Event date" defaultValue={parseDate('2026-04-17')} />);

  const day17 = screen.getByRole('button', { name: /April 17, 2026/ });
  day17.focus();
  expect(document.activeElement).toBe(day17);

  // ArrowRight advances to the next day in the grid.
  await userEvent.keyboard('{ArrowRight}');
  const day18 = screen.getByRole('button', { name: /April 18, 2026/ });
  expect(document.activeElement).toBe(day18);

  // ArrowDown jumps one full week ahead (7 days).
  await userEvent.keyboard('{ArrowDown}');
  const day25 = screen.getByRole('button', { name: /April 25, 2026/ });
  expect(document.activeElement).toBe(day25);
});
