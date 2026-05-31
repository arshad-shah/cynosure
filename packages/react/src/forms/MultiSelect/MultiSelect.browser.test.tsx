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
        placeholder="Add…"
        aria-label="Departments"
        style={{ width: 360 }}
      />
    </div>,
  );

  const input = screen.getByRole('textbox', { name: 'Departments' });
  fireEvent.focus(input);

  await screen.findByRole('listbox');
  const surface = document.querySelector<HTMLElement>(`.${popover}`);
  expect(surface).not.toBeNull();

  await waitFor(() => {
    const s = (surface as HTMLElement).getBoundingClientRect();
    const trigger = (input.closest('div') as HTMLElement).getBoundingClientRect();
    // Anchored ~4px below the trigger, not parked at the (0,0) origin.
    expect(s.top).toBeGreaterThan(0);
    expect(Math.abs(s.top - (trigger.bottom + 4))).toBeLessThanOrEqual(2);
    expect(Math.abs(s.width - trigger.width)).toBeLessThanOrEqual(2);
  });
});

test('MultiSelect adds a tag when an option is chosen in a real browser', async () => {
  render(
    <MultiSelect items={tags} placeholder="Add…" aria-label="Departments" style={{ width: 360 }} />,
  );
  const input = screen.getByRole('textbox', { name: 'Departments' });
  fireEvent.focus(input);

  const option = await screen.findByRole('option', { name: 'Design' });
  fireEvent.mouseDown(option);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Remove Design' })).toBeInTheDocument(),
  );
});
