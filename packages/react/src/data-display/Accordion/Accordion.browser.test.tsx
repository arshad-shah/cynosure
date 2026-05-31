import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { accordionContentInner } from './Accordion.css.js';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion.js';

/**
 * Real-browser layout check — the open panel measures its inner content's
 * `scrollHeight` (via ResizeObserver) and publishes it as the
 * `--radix-accordion-content-height` custom property that drives the
 * slide-down animation. jsdom reports `scrollHeight` as 0 and never lays the
 * content out, so the measured height can only be verified with a real engine.
 * Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Accordion publishes the measured content height when expanded', async () => {
  render(
    <div style={{ width: 400 }}>
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Question</AccordionTrigger>
          <AccordionContent>
            <p style={{ height: 120, margin: 0 }}>Answer body</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>,
  );

  const trigger = screen.getByRole('button', { name: 'Question' });
  fireEvent.click(trigger);

  const region = await screen.findByRole('region');
  const inner = region.querySelector<HTMLElement>(`.${accordionContentInner.split(' ')[0]}`);
  expect(inner).not.toBeNull();
  if (!inner) throw new Error('content inner missing');

  await waitFor(() => {
    const measured = Number.parseFloat(
      region.style.getPropertyValue('--radix-accordion-content-height'),
    );
    expect(measured).toBeGreaterThan(0);
    // The published height tracks the real laid-out content height.
    expect(Math.abs(measured - inner.scrollHeight)).toBeLessThanOrEqual(2);
  });
});
