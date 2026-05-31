import { parseDate } from '@internationalized/date';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { calendarPopover } from './DatePicker.css.js';
import { DatePicker } from './DatePicker.js';

/**
 * The calendar popover used to be pinned to a fixed `18rem` — ~12px narrower
 * than the month grid — so `overflow: auto` surfaced a permanent horizontal
 * scrollbar. It now sizes to `fit-content`. jsdom can't measure layout, so this
 * runs in a real browser (Chromium/Firefox/WebKit) where scroll/client widths
 * are meaningful.
 */
test('DatePicker calendar popover has no horizontal overflow', async () => {
  render(<DatePicker label="Start date" defaultValue={parseDate('2026-04-17')} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));

  // Wait for the calendar grid to mount inside the portalled popover.
  await screen.findByRole('grid');
  const popover = document.querySelector<HTMLElement>(`.${calendarPopover}`);
  expect(popover).not.toBeNull();

  await waitFor(() => {
    // No horizontal overflow: the scrollable width fits the visible width.
    expect((popover as HTMLElement).scrollWidth).toBeLessThanOrEqual(
      (popover as HTMLElement).clientWidth + 1,
    );
  });
});
