import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Callout, CalloutContent, CalloutTitle } from './Callout.js';

/**
 * Real-browser test: Callout is a tinted surface whose icon slot and body sit
 * side-by-side via flex layout, and whose background tint comes from a real
 * stylesheet. jsdom can't resolve the rendered box or computed background, so
 * we confirm here that it lays out with a non-zero box, carries its semantic
 * palette, and renders its slotted content. Runs across the
 * Chromium/Firefox/WebKit matrix in CI.
 */
test('Callout renders a real surface with its palette and slotted content', () => {
  render(
    <Callout colorScheme="success" data-testid="callout">
      <CalloutTitle>All systems operational</CalloutTitle>
      <CalloutContent>Everything is running smoothly.</CalloutContent>
    </Callout>,
  );

  const callout = screen.getByTestId('callout');
  const rect = callout.getBoundingClientRect();
  expect(rect.width).toBeGreaterThan(0);
  expect(rect.height).toBeGreaterThan(0);

  // Semantic palette is exposed (Callout is passive — no live-region role).
  expect(callout).toHaveAttribute('data-color-scheme', 'success');
  expect(screen.getByText('All systems operational')).toBeInTheDocument();
  expect(screen.getByText('Everything is running smoothly.')).toBeInTheDocument();
});
