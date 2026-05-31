import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { timelineConnector } from './Timeline.css.js';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from './Timeline.js';

/**
 * Real-browser layout check — in horizontal orientation the items become a
 * flex row and the connectors stretch with `flex: 1 1 auto` to fill the gap
 * between dots. jsdom computes no flexbox geometry, so left-to-right ordering
 * and the stretched connector width can only be verified with a real engine.
 * Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Timeline lays items left-to-right with stretched connectors when horizontal', () => {
  const { container } = render(
    <div style={{ width: 600 }}>
      <Timeline orientation="horizontal">
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>One</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>Two</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent>Three</TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>,
  );

  const left = (text: string): number =>
    screen.getByText(text).closest('li')?.getBoundingClientRect().left ?? Number.NaN;

  // Items flow across the row, each starting further right than the last.
  expect(left('Two')).toBeGreaterThan(left('One'));
  expect(left('Three')).toBeGreaterThan(left('Two'));

  // The connector stretches horizontally to bridge the dots.
  const connector = container.querySelector<HTMLElement>(`.${timelineConnector.split(' ')[0]}`);
  expect(connector).not.toBeNull();
  if (connector) {
    expect(connector.getBoundingClientRect().width).toBeGreaterThan(0);
  }
});
