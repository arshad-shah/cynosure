import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { RadioGroup } from '../RadioGroup/RadioGroup.js';
import { Radio } from './Radio.js';

/**
 * Real-browser test: the radio control is a custom button with a roving
 * tabindex and an overlaid indicator. Confirming it renders a measurable hit
 * target, is focusable, and that arrow-key navigation moves selection requires
 * a real layout/focus engine — jsdom reports zeroed boxes. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('RadioGroup selects on click and moves selection with arrow keys', () => {
  render(
    <RadioGroup defaultValue="a" aria-label="Choice" orientation="vertical">
      <Radio value="a">A</Radio>
      <Radio value="b">B</Radio>
      <Radio value="c">C</Radio>
    </RadioGroup>,
  );

  const a = screen.getByRole('radio', { name: 'A' });
  const b = screen.getByRole('radio', { name: 'B' });

  expect(a.getBoundingClientRect().width).toBeGreaterThan(0);
  expect(a).toHaveAttribute('aria-checked', 'true');

  fireEvent.click(b);
  expect(b).toHaveAttribute('aria-checked', 'true');
  expect(a).toHaveAttribute('aria-checked', 'false');

  // Arrow keys activate the next radio (ARIA radio-group semantics).
  b.focus();
  expect(b).toHaveFocus();
  fireEvent.keyDown(b, { key: 'ArrowDown' });
  const c = screen.getByRole('radio', { name: 'C' });
  expect(c).toHaveAttribute('aria-checked', 'true');
  expect(c).toHaveFocus();
});
