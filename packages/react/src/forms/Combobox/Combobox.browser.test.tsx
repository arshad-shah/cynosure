import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { popover } from '../shared/popover.css.js';
import { Combobox, type ComboboxItemData } from './Combobox.js';

/**
 * The filtered listbox renders inside a React Aria popover that portals to the
 * document body and is positioned relative to the input by a floating-element
 * positioner. jsdom returns zeroed `getBoundingClientRect`, so the real
 * placement (anchored below the field, matched to its width) can only be
 * verified with real layout. Runs across the Chromium/Firefox/WebKit matrix.
 */
const frameworks: ReadonlyArray<ComboboxItemData> = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

test('Combobox opens its listbox below the input with real placement', async () => {
  render(
    <div style={{ marginTop: 120 }}>
      <Combobox
        items={frameworks}
        placeholder="Search…"
        aria-label="Framework"
        style={{ width: 320 }}
      />
    </div>,
  );

  const input = screen.getByRole('combobox', { name: 'Framework' });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'V' } });

  await screen.findByRole('listbox');
  const surface = document.querySelector<HTMLElement>(`.${popover}`);
  expect(surface).not.toBeNull();

  await waitFor(() => {
    const s = (surface as HTMLElement).getBoundingClientRect();
    const i = input.getBoundingClientRect();
    // Anchored below the field, not parked at the (0,0) origin.
    expect(s.top).toBeGreaterThan(0);
    expect(s.top).toBeGreaterThanOrEqual(i.bottom - 4);
    expect(Math.abs(s.width - i.width)).toBeLessThanOrEqual(2);
  });
});

test('Combobox commits the chosen option to the input in a real browser', async () => {
  render(
    <Combobox
      items={frameworks}
      placeholder="Search…"
      aria-label="Framework"
      style={{ width: 320 }}
    />,
  );
  const input = screen.getByRole<HTMLInputElement>('combobox', { name: 'Framework' });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'Sv' } });

  fireEvent.click(await screen.findByRole('option', { name: 'Svelte' }));
  await waitFor(() => expect(input.value).toBe('Svelte'));
});
