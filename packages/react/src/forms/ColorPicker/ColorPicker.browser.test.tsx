import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { area } from './ColorPicker.css.js';
import { ColorPicker } from './ColorPicker.js';

/**
 * The 2D color area is sized by CSS (`width: 100%` + a per-size fixed height)
 * and the draggable color-picking surface only works when it has a real
 * bounding box. jsdom zeroes `getBoundingClientRect`, so its dimensions can
 * only be verified in a real browser (Chromium/Firefox/WebKit).
 */
test('ColorPicker inline color area has real rendered dimensions', async () => {
  const { container } = render(
    <div style={{ width: 320 }}>
      <ColorPicker variant="inline" defaultValue="#6366F1" />
    </div>,
  );

  const colorArea = container.querySelector<HTMLElement>(`.${area}`);
  expect(colorArea).not.toBeNull();

  await waitFor(() => {
    const rect = (colorArea as HTMLElement).getBoundingClientRect();
    // The area fills its panel width and has a non-trivial fixed height.
    expect(rect.width).toBeGreaterThan(100);
    expect(rect.height).toBeGreaterThan(80);
  });
});

test('ColorPicker popover opens with a real-dimensioned color area', async () => {
  render(<ColorPicker label="Brand colour" defaultValue="#6366F1" />);
  fireEvent.click(screen.getByRole('button', { name: 'Brand colour' }));

  await screen.findByRole('dialog', { name: 'Color picker' });
  const colorArea = document.querySelector<HTMLElement>(`.${area}`);
  expect(colorArea).not.toBeNull();

  await waitFor(() => {
    const rect = (colorArea as HTMLElement).getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(100);
    expect(rect.height).toBeGreaterThan(80);
  });
});
