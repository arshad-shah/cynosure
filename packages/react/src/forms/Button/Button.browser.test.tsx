import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Button } from './Button.js';

/**
 * Real-browser test: jsdom can't resolve the focus ring (`:focus-visible`) or
 * report a non-zero rendered box, so verifying that a real `<button>` receives
 * focus, fires its click handler, and lays out with measurable size needs an
 * actual layout engine. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Button fires its click handler and is focusable with a real layout box', () => {
  let clicks = 0;
  render(<Button onClick={() => clicks++}>Continue</Button>);
  const button = screen.getByRole('button', { name: 'Continue' });

  // Renders a real, measurable button (jsdom would report 0×0).
  const rect = button.getBoundingClientRect();
  expect(rect.width).toBeGreaterThan(0);
  expect(rect.height).toBeGreaterThan(0);

  button.focus();
  expect(button).toHaveFocus();

  fireEvent.click(button);
  fireEvent.click(button);
  expect(clicks).toBe(2);
});

test('disabled Button does not fire its handler', () => {
  let clicks = 0;
  render(
    <Button disabled onClick={() => clicks++}>
      Continue
    </Button>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(clicks).toBe(0);
});
