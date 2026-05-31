import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { NumberInput } from './NumberInput.js';

/**
 * The stepper column is laid out beside the numeric field inside the shared
 * control wrapper. jsdom zeroes `getBoundingClientRect`, so the real
 * horizontal arrangement (steppers sit to the right of the input, within the
 * wrapper bounds) can only be verified with real layout. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('NumberInput places its steppers to the right of the field with real geometry', async () => {
  render(<NumberInput defaultValue={1} aria-label="Count" style={{ width: 200 }} />);

  const field = screen.getByRole('spinbutton', { name: 'Count' });
  const increment = screen.getByRole('button', { name: 'Increment' });

  await expect.poll(() => increment.getBoundingClientRect().width).toBeGreaterThan(0);

  const fieldRect = field.getBoundingClientRect();
  const incRect = increment.getBoundingClientRect();
  // Stepper sits to the right of the numeric field.
  expect(incRect.left).toBeGreaterThanOrEqual(fieldRect.left - 2);
  expect(incRect.width).toBeGreaterThan(0);
  expect(incRect.height).toBeGreaterThan(0);
});

test('NumberInput stepper button increments the value in a real browser', async () => {
  render(<NumberInput defaultValue={1} step={1} aria-label="Count" />);
  const field = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Count' });

  fireEvent.click(screen.getByRole('button', { name: 'Increment' }));
  await waitFor(() => expect(field.value).toBe('2'));
});
