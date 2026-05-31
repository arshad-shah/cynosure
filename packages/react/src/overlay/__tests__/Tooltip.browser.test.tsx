import { render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Tooltip } from '../Tooltip/index.js';

/**
 * Real-browser positioning — jsdom can't measure layout. Tooltip already
 * positions via top/left (so the entrance keyframe's transform can't park it
 * at the origin); this pins that behaviour across the CI browser matrix.
 */
test('Tooltip anchors above the trigger for side="top"', async () => {
  render(
    // Push the trigger down so there is room above it (no collision flip).
    <div style={{ marginTop: 200 }}>
      <Tooltip content="Tip body" open side="top" sideOffset={6}>
        <button type="button">Trigger</button>
      </Tooltip>
    </div>,
  );
  const tip = await screen.findByRole('tooltip');
  const trigger = screen.getByText('Trigger');

  await waitFor(() => {
    const tp = tip.getBoundingClientRect();
    const tr = trigger.getBoundingClientRect();
    expect(tp.top).toBeGreaterThan(0);
    // Bottom edge of the tip sits sideOffset px above the trigger's top.
    expect(Math.abs(tp.bottom - (tr.top - 6))).toBeLessThanOrEqual(2);
  });
});
