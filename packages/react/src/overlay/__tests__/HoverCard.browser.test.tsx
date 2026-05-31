import { render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../HoverCard/index.js';

/**
 * Real-browser positioning — jsdom can't measure layout. HoverCard shares the
 * floating-position logic with Popover and was fixed to position via top/left
 * (so the shared entrance keyframe's transform can't park it at the origin).
 * Rendered with `open` controlled to avoid hover-delay timing flakiness.
 */
test('HoverCard anchors its content below the trigger, not at the origin', async () => {
  render(
    <HoverCard open>
      <HoverCardTrigger>Trigger</HoverCardTrigger>
      <HoverCardContent sideOffset={8}>
        <div style={{ width: 200, height: 80 }}>Body</div>
      </HoverCardContent>
    </HoverCard>,
  );
  const card = await screen.findByRole('dialog');
  const trigger = screen.getByText('Trigger');

  await waitFor(() => {
    const c = card.getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    expect(c.top).toBeGreaterThan(0);
    expect(Math.abs(c.top - (t.bottom + 8))).toBeLessThanOrEqual(2);
  });
});
