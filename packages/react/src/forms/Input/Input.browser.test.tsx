import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Input } from './Input.js';

/**
 * The multi-well layout lays a leading slot, the field, and a trailing slot in
 * a horizontal row. jsdom returns zeroed `getBoundingClientRect`, so the
 * real horizontal ordering (leading well sits left of the input, trailing well
 * sits right of it) and the resolved control height can only be verified with
 * real layout. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Input lays leading/trailing slots on either side of the field with real geometry', async () => {
  render(
    <Input
      aria-label="Amount"
      leadingSlot="https://"
      trailingSlot=".com"
      defaultValue="example"
      style={{ width: 320 }}
    />,
  );

  const input = screen.getByRole('textbox', { name: 'Amount' });
  await expect.poll(() => input.getBoundingClientRect().height).toBeGreaterThan(0);

  const inputRect = input.getBoundingClientRect();
  const leading = screen.getByText('https://').getBoundingClientRect();
  const trailing = screen.getByText('.com').getBoundingClientRect();

  // Leading well sits left of the input; trailing well sits right of it.
  expect(leading.right).toBeLessThanOrEqual(inputRect.left + 2);
  expect(trailing.left).toBeGreaterThanOrEqual(inputRect.right - 2);
});

test('Input reflects typed values in a real browser', async () => {
  render(<Input aria-label="Name" />);
  const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' });

  fireEvent.change(input, { target: { value: 'Ada' } });
  await waitFor(() => expect(input.value).toBe('Ada'));
});
