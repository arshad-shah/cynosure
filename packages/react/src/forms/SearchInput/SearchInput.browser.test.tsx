import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { SearchInput } from './SearchInput.js';

/**
 * SearchInput wraps the multi-well Input: a leading search-icon well sits left
 * of the field and a clear-button well appears on the right once there is
 * content. jsdom zeroes `getBoundingClientRect`, so the real horizontal
 * arrangement of those wells can only be verified with real layout. Runs
 * across the Chromium/Firefox/WebKit matrix in CI.
 */
test('SearchInput renders the clear button to the right of the field with real geometry', async () => {
  render(<SearchInput defaultValue="hello" aria-label="Search" style={{ width: 320 }} />);

  const input = screen.getByRole('searchbox', { name: 'Search' });
  const clear = screen.getByRole('button', { name: 'Clear input' });

  await expect.poll(() => clear.getBoundingClientRect().width).toBeGreaterThan(0);

  const inputRect = input.getBoundingClientRect();
  const clearRect = clear.getBoundingClientRect();
  // Clear affordance sits to the right of the input field.
  expect(clearRect.left).toBeGreaterThanOrEqual(inputRect.right - 4);
});

test('SearchInput reflects typed values and clears on Escape in a real browser', async () => {
  render(<SearchInput aria-label="Search" />);
  const input = screen.getByRole<HTMLInputElement>('searchbox', { name: 'Search' });

  fireEvent.change(input, { target: { value: 'react' } });
  await waitFor(() => expect(input.value).toBe('react'));

  fireEvent.keyDown(input, { key: 'Escape' });
  await waitFor(() => expect(input.value).toBe(''));
});
