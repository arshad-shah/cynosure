import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { popover } from '../shared/popover.css.js';
import { MultiSelect, type MultiSelectItemData } from './MultiSelect.js';

/**
 * MultiSelect measures its trigger with `getBoundingClientRect` in a layout
 * effect and absolutely positions a portalled popover just below it (top =
 * trigger.bottom + scrollY + 4, width = trigger width). jsdom zeroes layout, so
 * the real anchoring can only be verified in a real browser
 * (Chromium/Firefox/WebKit).
 */
const tags: ReadonlyArray<MultiSelectItemData> = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
];

test('MultiSelect anchors its listbox below the trigger with real placement', async () => {
  render(
    <div style={{ marginTop: 120 }}>
      <MultiSelect
        items={tags}
        placeholder="Select…"
        aria-label="Departments"
        style={{ width: 360 }}
      />
    </div>,
  );

  const trigger = screen.getByRole('combobox', { name: 'Departments' });
  fireEvent.click(trigger);

  await screen.findByRole('listbox');
  const surface = document.querySelector<HTMLElement>(`.${popover}`);
  expect(surface).not.toBeNull();

  await waitFor(() => {
    const s = (surface as HTMLElement).getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    // Anchored ~4px below the trigger, not parked at the (0,0) origin.
    expect(s.top).toBeGreaterThan(0);
    expect(Math.abs(s.top - (t.bottom + 4))).toBeLessThanOrEqual(2);
    expect(Math.abs(s.width - t.width)).toBeLessThanOrEqual(2);
  });
});

test('MultiSelect adds a chip when an option is chosen, keeping it in the list', async () => {
  render(
    <MultiSelect
      items={tags}
      placeholder="Select…"
      aria-label="Departments"
      style={{ width: 360 }}
    />,
  );
  const trigger = screen.getByRole('combobox', { name: 'Departments' });
  fireEvent.click(trigger);

  const designOption = await screen.findByRole('option', { name: 'Design' });
  fireEvent.mouseDown(designOption);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Remove Design' })).toBeInTheDocument(),
  );
  // The option stays in the list, now marked selected — every item stays reachable.
  await waitFor(() =>
    expect(screen.getByRole('option', { name: 'Design' })).toHaveAttribute('aria-selected', 'true'),
  );
});

test('MultiSelect keeps a fixed-height trigger and shows a +N badge on overflow', async () => {
  render(
    <MultiSelect
      items={tags}
      defaultValue={['design', 'engineering', 'marketing']}
      aria-label="Departments"
      style={{ width: 140 }}
    />,
  );

  const trigger = screen.getByRole('combobox', { name: 'Departments' });
  await expect.poll(() => trigger.getBoundingClientRect().height).toBeGreaterThan(0);

  // Three chips can't fit in 140px — a "+N" badge collapses the overflow, and
  // the trigger stays a single row (well under two lines of chips).
  await waitFor(() => expect(screen.getByText(/^\+\d+$/)).toBeInTheDocument());
  expect(trigger.getBoundingClientRect().height).toBeLessThanOrEqual(56);
});
