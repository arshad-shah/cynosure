import { Time } from '@internationalized/date';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { TimeValue } from 'react-aria-components';
import { expect, test } from 'vitest';
import { TimePicker } from './TimePicker.js';

/**
 * Real-browser focus-management check — the segmented time field relies on the
 * browser's real focus model: Tab moves between segments and the focused
 * spinbutton responds to ArrowUp/Down. jsdom only approximates focus traversal
 * and segment editing, so this keyboard-driven editing is best exercised in a
 * real engine. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
function Harness(): React.ReactElement {
  const [value, setValue] = useState<TimeValue | null>(new Time(9, 30));
  return <TimePicker label="Meeting time" value={value} onChange={setValue} hourCycle={24} />;
}

test('TimePicker edits segments with keyboard focus and arrow keys', async () => {
  render(<Harness />);

  const hour = screen.getByRole('spinbutton', { name: /hour/i });
  hour.focus();
  expect(document.activeElement).toBe(hour);
  expect(hour).toHaveAttribute('aria-valuenow', '9');

  await userEvent.keyboard('{ArrowUp}');
  await waitFor(() => {
    expect(hour).toHaveAttribute('aria-valuenow', '10');
  });

  // Tabbing advances focus to the next (minute) segment.
  await userEvent.tab();
  const minute = screen.getByRole('spinbutton', { name: /minute/i });
  expect(document.activeElement).toBe(minute);
});
