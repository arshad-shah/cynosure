import { Heading } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '20rem' }}>
      <Heading level={3} truncate>
        A long card title that elides when the row runs out of room
      </Heading>
      <Heading level={3} size="lg" truncate={2}>
        Two-line clamp keeps the title scannable while still showing enough of the longer phrasing
        to make sense
      </Heading>
    </div>
  );
}
