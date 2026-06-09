import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { NumberInput } from './NumberInput.js';

/**
 * The control is a segmented `[ − ][ value ][ + ]` row inside a tinted track.
 * jsdom zeroes `getBoundingClientRect`, so the real horizontal arrangement
 * (decrement left of the field, increment right of it) can only be verified
 * with real layout. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('NumberInput lays out − value + segments left-to-right with real geometry', async () => {
  render(<NumberInput defaultValue={1} aria-label="Count" style={{ width: 240 }} />);

  const field = screen.getByRole('spinbutton', { name: 'Count' });
  const increment = screen.getByRole('button', { name: 'Increment' });
  const decrement = screen.getByRole('button', { name: 'Decrement' });

  await expect.poll(() => increment.getBoundingClientRect().width).toBeGreaterThan(0);

  const fieldRect = field.getBoundingClientRect();
  const incRect = increment.getBoundingClientRect();
  const decRect = decrement.getBoundingClientRect();

  // Decrement sits left of the field, increment sits right of it.
  expect(decRect.left).toBeLessThanOrEqual(fieldRect.left + 2);
  expect(incRect.left).toBeGreaterThanOrEqual(fieldRect.right - 2);
  // Touch-friendly target at the default (md) size.
  expect(incRect.height).toBeGreaterThanOrEqual(40);
  expect(incRect.width).toBeGreaterThanOrEqual(40);
});

test('NumberInput stepper buttons change the value in a real browser', async () => {
  render(<NumberInput defaultValue={1} step={1} aria-label="Count" />);
  const field = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Count' });

  fireEvent.click(screen.getByRole('button', { name: 'Increment' }));
  await waitFor(() => expect(field.value).toBe('2'));

  fireEvent.click(screen.getByRole('button', { name: 'Decrement' }));
  await waitFor(() => expect(field.value).toBe('1'));
});

test('NumberInput disables the stepper that would cross min/max', async () => {
  render(<NumberInput defaultValue={10} minValue={0} maxValue={10} aria-label="Count" />);

  const increment = screen.getByRole<HTMLButtonElement>('button', { name: 'Increment' });
  const decrement = screen.getByRole<HTMLButtonElement>('button', { name: 'Decrement' });

  // At the max, increment is disabled but decrement is live.
  await waitFor(() => expect(increment).toBeDisabled());
  expect(decrement).not.toBeDisabled();
});
