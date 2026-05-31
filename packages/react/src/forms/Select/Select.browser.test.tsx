import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { popover } from '../shared/popover.css.js';
import { Select, type SelectItemData } from './Select.js';

/**
 * The listbox renders inside a React Aria popover that portals to the document
 * body and is positioned relative to the trigger by a floating-element
 * positioner. jsdom returns zeroed `getBoundingClientRect`, so the real
 * placement (popover anchored below the trigger, not parked at the origin, and
 * matched to the trigger width) can only be verified with real layout. Runs
 * across the Chromium/Firefox/WebKit matrix in CI.
 */
const fruits: ReadonlyArray<SelectItemData> = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

test('Select opens its listbox below the trigger with real placement', async () => {
  render(
    <div style={{ marginTop: 120 }}>
      <Select placeholder="Pick a fruit" items={fruits} aria-label="Fruit" style={{ width: 280 }} />
    </div>,
  );

  const trigger = screen.getByRole('button', { name: /Pick a fruit/i });
  fireEvent.click(trigger);

  await screen.findByRole('listbox');
  const surface = document.querySelector<HTMLElement>(`.${popover}`);
  expect(surface).not.toBeNull();

  await waitFor(() => {
    const s = (surface as HTMLElement).getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    // Anchored below the trigger, not parked at the (0,0) origin.
    expect(s.top).toBeGreaterThan(0);
    expect(s.top).toBeGreaterThanOrEqual(t.bottom - 2);
    // Popover matches the trigger width (within rounding tolerance).
    expect(Math.abs(s.width - t.width)).toBeLessThanOrEqual(2);
  });
});

test('Select updates the trigger label after picking an option in a real browser', async () => {
  render(
    <Select placeholder="Pick a fruit" items={fruits} aria-label="Fruit" style={{ width: 280 }} />,
  );
  const trigger = screen.getByRole('button', { name: /Pick a fruit/i });
  fireEvent.click(trigger);

  fireEvent.click(await screen.findByRole('option', { name: 'Cherry' }));
  await waitFor(() => expect(trigger).toHaveTextContent('Cherry'));
});
