import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@arshad-shah/cynosure-react';

const events = [
  { color: 'success', label: 'Build succeeded', time: '10:14' },
  { color: 'info', label: 'Deploy started', time: '10:14' },
  { color: 'warning', label: 'Slow database query', time: '10:17' },
  { color: 'danger', label: 'Health check failed', time: '10:19' },
] as const;

export default function Example() {
  return (
    <Timeline>
      {events.map((event, idx) => (
        <TimelineItem key={event.label}>
          <TimelineSeparator>
            <TimelineDot colorScheme={event.color} />
            {idx < events.length - 1 ? <TimelineConnector /> : null}
          </TimelineSeparator>
          <TimelineContent>
            <strong>{event.label}</strong>
            <div style={{ color: 'var(--cynosure-color-fg-muted)', fontSize: '0.875rem' }}>
              {event.time}
            </div>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
