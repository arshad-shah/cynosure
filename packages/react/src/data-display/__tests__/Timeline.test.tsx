import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '../Timeline/index.js';

describe('Timeline', () => {
  it('renders timeline items with data-last on the final item', () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>first</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot colorScheme="success" />
          </TimelineSeparator>
          <TimelineContent>last</TimelineContent>
        </TimelineItem>
      </Timeline>,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[items.length - 1]).toHaveAttribute('data-last', 'true');
  });
});
