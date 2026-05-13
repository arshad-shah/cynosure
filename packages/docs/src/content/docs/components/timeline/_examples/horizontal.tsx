import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@arshad-shah/cynosure-react';

const steps = ['Account', 'Profile', 'Workspace', 'Done'];

export default function Example() {
  return (
    <Timeline orientation="horizontal">
      {steps.map((label, idx) => (
        <TimelineItem key={label}>
          <TimelineSeparator>
            <TimelineDot
              colorScheme={idx <= 1 ? 'success' : 'accent'}
              variant={idx <= 1 ? 'solid' : 'outline'}
            />
            {idx < steps.length - 1 ? <TimelineConnector /> : null}
          </TimelineSeparator>
          <TimelineContent>
            <strong>{label}</strong>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
