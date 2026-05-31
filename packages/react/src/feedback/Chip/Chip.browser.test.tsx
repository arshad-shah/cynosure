import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactElement, useState } from 'react';
import { expect, test } from 'vitest';
import { Chip } from './Chip.js';

/**
 * Real-browser test: a removable Chip renders two adjacent focusable buttons
 * (the toggle and the × remove control) laid out inline. Confirming both are
 * real, separately-targetable hit targets and that the remove control removes
 * the node needs a real layout engine — jsdom reports zeroed boxes. Runs
 * across the Chromium/Firefox/WebKit matrix in CI.
 */
function Demo(): ReactElement {
  const [selected, setSelected] = useState(false);
  const [open, setOpen] = useState(true);
  if (!open) return <p>Removed</p>;
  return (
    <Chip selected={selected} onSelectedChange={setSelected} onRemove={() => setOpen(false)}>
      React
    </Chip>
  );
}

test('Chip toggles on click and its remove button removes the chip', async () => {
  render(<Demo />);
  const toggle = screen.getByRole('button', { name: 'React' });
  const remove = screen.getByRole('button', { name: 'Remove React' });

  expect(toggle.getBoundingClientRect().width).toBeGreaterThan(0);
  // The remove button sits to the right of the label toggle.
  expect(remove.getBoundingClientRect().left).toBeGreaterThanOrEqual(
    toggle.getBoundingClientRect().left,
  );

  expect(toggle).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(remove);
  await waitFor(() => {
    expect(screen.queryByRole('button', { name: 'React' })).not.toBeInTheDocument();
  });
  expect(screen.getByText('Removed')).toBeInTheDocument();
});
