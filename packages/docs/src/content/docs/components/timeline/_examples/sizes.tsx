import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@arshad-shah/cynosure-react';

function Sample({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return (
    <Timeline size={size}>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <strong>Created</strong>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>
          <strong>Shipped</strong>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <Sample size="sm" />
      <Sample size="md" />
      <Sample size="lg" />
    </div>
  );
}
