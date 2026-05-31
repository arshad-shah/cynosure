import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs.js';

/**
 * Real-browser layout checks — the sliding active-tab indicator measures the
 * active trigger via `getBoundingClientRect` and writes the geometry into CSS
 * custom properties. jsdom zeroes every rect, so the indicator's position can
 * only be verified with real layout. Runs across the Chromium/Firefox/WebKit
 * matrix in CI.
 */
test('Tabs indicator slides to track the active trigger', async () => {
  render(
    <div style={{ width: 480 }}>
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
          <TabsTrigger value="three">Three</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
        <TabsContent value="three">Third</TabsContent>
      </Tabs>
    </div>,
  );

  const list = screen.getByRole('tablist');
  const indicator = list.querySelector<HTMLElement>('[data-cynosure-variant][aria-hidden="true"]');
  expect(indicator).not.toBeNull();
  if (!indicator) throw new Error('indicator missing');

  const firstTab = screen.getByRole('tab', { name: 'One' });
  await waitFor(() => {
    const w = indicator.style.getPropertyValue('--cynosure-tabs-indicator-width');
    expect(Number.parseFloat(w)).toBeGreaterThan(0);
    // Indicator width matches the active trigger's measured width.
    expect(
      Math.abs(Number.parseFloat(w) - firstTab.getBoundingClientRect().width),
    ).toBeLessThanOrEqual(2);
  });

  const initialLeft = Number.parseFloat(
    indicator.style.getPropertyValue('--cynosure-tabs-indicator-left'),
  );

  fireEvent.click(screen.getByRole('tab', { name: 'Three' }));
  const thirdTab = screen.getByRole('tab', { name: 'Three' });

  await waitFor(() => {
    const left = Number.parseFloat(
      indicator.style.getPropertyValue('--cynosure-tabs-indicator-left'),
    );
    // The indicator moved to the right to sit under the third trigger.
    expect(left).toBeGreaterThan(initialLeft);
    const listLeft = list.getBoundingClientRect().left;
    expect(Math.abs(left - (thirdTab.getBoundingClientRect().left - listLeft))).toBeLessThanOrEqual(
      2,
    );
  });
});
