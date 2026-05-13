import { Heading } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Heading level={2} size="5xl">
        Size 5xl
      </Heading>
      <Heading level={2} size="4xl">
        Size 4xl
      </Heading>
      <Heading level={2} size="3xl">
        Size 3xl
      </Heading>
      <Heading level={2} size="2xl">
        Size 2xl
      </Heading>
      <Heading level={2} size="xl">
        Size xl
      </Heading>
      <Heading level={2} size="lg">
        Size lg
      </Heading>
      <Heading level={2} size="md">
        Size md
      </Heading>
      <Heading level={2} size="sm">
        Size sm
      </Heading>
      <Heading level={2} size="xs">
        Size xs
      </Heading>
    </div>
  );
}
