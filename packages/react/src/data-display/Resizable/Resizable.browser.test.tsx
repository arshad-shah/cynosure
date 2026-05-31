import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Resizable, ResizableHandle, ResizablePanel } from './Resizable.js';

/**
 * Real-browser layout check — panel sizes are expressed as `flex-grow`
 * proportions resolved by the flexbox layout engine against the container's
 * pixel width. jsdom does not compute flexbox geometry, so the panels collapse
 * to zero there; the real rendered split ratio can only be verified in a real
 * engine. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Resizable splits its panels by the configured default sizes', () => {
  render(
    <div style={{ width: 500, height: 200 }}>
      <Resizable direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <div data-testid="left" style={{ height: '100%' }}>
            Left
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <div data-testid="right" style={{ height: '100%' }}>
            Right
          </div>
        </ResizablePanel>
      </Resizable>
    </div>,
  );

  const left = screen.getByTestId('left').getBoundingClientRect().width;
  const right = screen.getByTestId('right').getBoundingClientRect().width;

  expect(left).toBeGreaterThan(0);
  expect(right).toBeGreaterThan(0);
  // The right panel is wider — and the two split roughly 40/60 of the total.
  expect(right).toBeGreaterThan(left);
  const total = left + right;
  expect(Math.abs(left / total - 0.4)).toBeLessThan(0.05);
  expect(Math.abs(right / total - 0.6)).toBeLessThan(0.05);
});
