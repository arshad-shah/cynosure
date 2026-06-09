import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { NumberInput } from './NumberInput.js';

/**
 * The segmented layout — `[ − ][ value ][ + ]` — is laid out with real flex
 * geometry that jsdom can't measure (it zeroes `getBoundingClientRect`). These
 * run across the Chromium/Firefox/WebKit matrix in CI.
 */

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

test('NumberInput lays out − / value / + left-to-right with real geometry', async () => {
  render(<NumberInput defaultValue={1} aria-label="Count" style={{ width: 240 }} />);

  const field = screen.getByRole('spinbutton', { name: 'Count' });
  const decrement = screen.getByRole('button', { name: 'Decrement' });
  const increment = screen.getByRole('button', { name: 'Increment' });

  await expect.poll(() => increment.getBoundingClientRect().width).toBeGreaterThan(0);

  const fieldRect = field.getBoundingClientRect();
  const decRect = decrement.getBoundingClientRect();
  const incRect = increment.getBoundingClientRect();

  // Decrement sits to the left of the field, increment to the right.
  expect(decRect.right).toBeLessThanOrEqual(fieldRect.left + 2);
  expect(incRect.left).toBeGreaterThanOrEqual(fieldRect.right - 2);
  // Touch-friendly target — ~44px tall at the default `md` size.
  expect(incRect.height).toBeGreaterThanOrEqual(40);
});

test('NumberInput stepper buttons increment and decrement the value', async () => {
  render(<NumberInput defaultValue={1} step={1} aria-label="Count" />);
  const field = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Count' });

  fireEvent.click(screen.getByRole('button', { name: 'Increment' }));
  await waitFor(() => expect(field.value).toBe('2'));

  fireEvent.click(screen.getByRole('button', { name: 'Decrement' }));
  await waitFor(() => expect(field.value).toBe('1'));
});

test('NumberInput arrow keys change the value', async () => {
  render(<NumberInput defaultValue={5} step={1} aria-label="Count" />);
  const field = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Count' });

  field.focus();
  fireEvent.keyDown(field, { key: 'ArrowUp' });
  fireEvent.keyDown(field, { key: 'ArrowUp' });
  await waitFor(() => expect(field.value).toBe('7'));

  fireEvent.keyDown(field, { key: 'ArrowDown' });
  await waitFor(() => expect(field.value).toBe('6'));
});

test('NumberInput hold-to-repeat steps by more than one while held', async () => {
  render(<NumberInput defaultValue={0} step={1} aria-label="Count" />);
  const field = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Count' });
  const increment = screen.getByRole('button', { name: 'Increment' });

  // react-aria's stepper buttons repeat on press-and-hold (initial step, then
  // an accelerating interval). Hold long enough to clear the start delay.
  fireEvent.pointerDown(increment, { button: 0, pointerId: 1, pointerType: 'mouse' });
  await wait(900);
  fireEvent.pointerUp(increment, { button: 0, pointerId: 1, pointerType: 'mouse' });

  await waitFor(() => expect(Number(field.value)).toBeGreaterThan(1));
});

test('NumberInput disables the increment button at maxValue', async () => {
  render(<NumberInput defaultValue={10} minValue={0} maxValue={10} aria-label="Count" />);

  const increment = screen.getByRole('button', { name: 'Increment' });
  const decrement = screen.getByRole('button', { name: 'Decrement' });
  await waitFor(() => expect(increment).toBeDisabled());
  expect(decrement).not.toBeDisabled();
});

test('NumberInput disabled state disables both steppers', async () => {
  render(<NumberInput defaultValue={5} isDisabled aria-label="Count" />);

  expect(screen.getByRole('button', { name: 'Increment' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Decrement' })).toBeDisabled();
});

test('NumberInput renders prefix and suffix affixes', async () => {
  render(<NumberInput defaultValue={1200} prefix="$" suffix="USD" aria-label="Amount" />);

  expect(screen.getByText('$')).toBeTruthy();
  expect(screen.getByText('USD')).toBeTruthy();
  // Affixes are decorative — the accessible value is the number itself.
  expect(screen.getByRole('spinbutton', { name: 'Amount' })).toBeTruthy();
});

test('NumberInput long-press on the value clears to minValue when enabled', async () => {
  render(<NumberInput defaultValue={42} minValue={0} clearOnLongPress aria-label="Count" />);
  const field = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Count' });

  // Long-press bubbles from the input up to the value segment's handler.
  fireEvent.pointerDown(field, { button: 0, pointerId: 1, pointerType: 'touch' });
  await wait(700);
  fireEvent.pointerUp(field, { button: 0, pointerId: 1, pointerType: 'touch' });

  await waitFor(() => expect(field.value).toBe('0'));
});

test('NumberInput does not clear on long-press by default', async () => {
  render(<NumberInput defaultValue={42} minValue={0} aria-label="Count" />);
  const field = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Count' });

  fireEvent.pointerDown(field, { button: 0, pointerId: 1, pointerType: 'touch' });
  await wait(700);
  fireEvent.pointerUp(field, { button: 0, pointerId: 1, pointerType: 'touch' });

  expect(field.value).toBe('42');
});
