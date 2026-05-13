import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@arshad-shah/cynosure-react';

const IconCheck = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconDot = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

export default function Example() {
  return (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="success" icon={<IconCheck />} />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <strong>Deployed v1.0</strong>
          <div style={{ color: 'var(--cynosure-color-fg-muted)', fontSize: '0.875rem' }}>
            10 minutes ago
          </div>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="accent" icon={<IconDot />} variant="outline" />
        </TimelineSeparator>
        <TimelineContent>
          <strong>Preparing v1.1</strong>
          <div style={{ color: 'var(--cynosure-color-fg-muted)', fontSize: '0.875rem' }}>
            in progress
          </div>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
