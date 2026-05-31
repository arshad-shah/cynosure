import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible.js';

/**
 * Real-browser layout check — the open panel measures its intrinsic
 * `scrollHeight` (via ResizeObserver) and writes it to the
 * `--radix-collapsible-content-height` custom property that the height
 * animation reads. jsdom reports `scrollHeight` as 0 and never lays content
 * out, so the measured value can only be confirmed with a real engine. Runs
 * across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Collapsible publishes the measured content height when open', async () => {
  render(
    <div style={{ width: 400 }}>
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>
          <div style={{ height: 150 }}>Panel body</div>
        </CollapsibleContent>
      </Collapsible>
    </div>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
  const region = await screen.findByRole('region');

  await waitFor(() => {
    const measured = Number.parseFloat(
      region.style.getPropertyValue('--radix-collapsible-content-height'),
    );
    expect(measured).toBeGreaterThan(0);
    // The published height matches the panel's real laid-out height.
    expect(Math.abs(measured - region.scrollHeight)).toBeLessThanOrEqual(2);
  });
});
