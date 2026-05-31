import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandMenu,
} from '../CommandPalette/index.js';

/**
 * Real-browser checks — jsdom can't measure layout. CommandMenu renders inside
 * a centered modal dialog; here we verify in a real browser that the palette
 * surface paints with a real, non-zero bounding box (not collapsed at the
 * origin) and that typing in the input filters the rendered rows. Runs across
 * the Chromium/Firefox/WebKit matrix in CI.
 */
test('CommandMenu paints a real dialog and filters items as you type', async () => {
  render(
    <CommandMenu open label="Commands">
      <CommandInput placeholder="Find…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem>Open file</CommandItem>
          <CommandItem>Open terminal</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandMenu>,
  );

  const dialog = await screen.findByRole('dialog');
  await waitFor(() => {
    const d = dialog.getBoundingClientRect();
    expect(d.width).toBeGreaterThan(0);
    expect(d.height).toBeGreaterThan(0);
  });

  expect(screen.getByText('Open file')).toBeInTheDocument();
  const input = screen.getByPlaceholderText('Find…');
  fireEvent.change(input, { target: { value: 'terminal' } });
  await waitFor(() => expect(screen.queryByText('Open file')).not.toBeInTheDocument());
  expect(screen.getByText('Open terminal')).toBeInTheDocument();
});
