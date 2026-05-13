import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <strong>Signed up</strong>
          <div style={{ color: 'var(--cynosure-color-fg-muted)', fontSize: '0.875rem' }}>
            Jan 14, 2024
          </div>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <strong>Upgraded to Pro</strong>
          <div style={{ color: 'var(--cynosure-color-fg-muted)', fontSize: '0.875rem' }}>
            Feb 02, 2024
          </div>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>
          <strong>Invited team</strong>
          <div style={{ color: 'var(--cynosure-color-fg-muted)', fontSize: '0.875rem' }}>
            Mar 18, 2024
          </div>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
