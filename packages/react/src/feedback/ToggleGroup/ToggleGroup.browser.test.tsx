import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup.js';

/**
 * Real-browser test: the attached group renders a segmented bar whose items
 * share borders and sit on one row — geometry that only resolves with a real
 * layout engine (jsdom reports zeroed boxes). We also drive roving-tabindex
 * arrow navigation, which needs a real focus engine. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('attached single-select ToggleGroup lays items in a row and changes selection', () => {
  render(
    <ToggleGroup type="single" defaultValue="left" attached aria-label="Alignment">
      <ToggleGroupItem value="left" aria-label="Left">
        L
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center">
        C
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right">
        R
      </ToggleGroupItem>
    </ToggleGroup>,
  );

  const left = screen.getByRole('radio', { name: 'Left' });
  const center = screen.getByRole('radio', { name: 'Center' });
  const leftRect = left.getBoundingClientRect();
  const centerRect = center.getBoundingClientRect();

  // Same row, attached (next item butts up to the previous).
  expect(Math.abs(leftRect.top - centerRect.top)).toBeLessThanOrEqual(2);
  expect(Math.abs(centerRect.left - leftRect.right)).toBeLessThanOrEqual(2);

  expect(left).toHaveAttribute('aria-checked', 'true');
  fireEvent.click(center);
  expect(center).toHaveAttribute('aria-checked', 'true');
  expect(left).toHaveAttribute('aria-checked', 'false');

  // Arrow navigation moves focus between enabled items.
  center.focus();
  expect(center).toHaveFocus();
  fireEvent.keyDown(center, { key: 'ArrowRight' });
  expect(screen.getByRole('radio', { name: 'Right' })).toHaveFocus();
});
