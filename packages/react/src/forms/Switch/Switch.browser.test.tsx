import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { switchThumb } from './Switch.css.js';
import { Switch } from './Switch.js';

/**
 * Real-browser test: toggling the switch animates the thumb from one end of
 * the track to the other via a CSS transform. Verifying the thumb actually
 * moves (its rendered `left` increases) requires a real layout engine — jsdom
 * reports zeroed/static boxes. Runs across the Chromium/Firefox/WebKit matrix.
 */
test('Switch slides its thumb to the right when toggled on', async () => {
  render(<Switch aria-label="Wifi" />);
  const sw = screen.getByRole('switch');
  const thumb = sw.querySelector<HTMLElement>(`.${switchThumb}`);
  expect(thumb).not.toBeNull();

  const offLeft = (thumb as HTMLElement).getBoundingClientRect().left;
  expect(sw).toHaveAttribute('aria-checked', 'false');

  fireEvent.click(sw);
  expect(sw).toHaveAttribute('aria-checked', 'true');

  await waitFor(() => {
    const onLeft = (thumb as HTMLElement).getBoundingClientRect().left;
    expect(onLeft).toBeGreaterThan(offLeft + 2);
  });
});
