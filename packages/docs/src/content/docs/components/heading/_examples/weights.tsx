import { Heading } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Heading level={3} weight="regular">
        Regular weight
      </Heading>
      <Heading level={3} weight="medium">
        Medium weight
      </Heading>
      <Heading level={3} weight="semibold">
        Semibold weight
      </Heading>
      <Heading level={3} weight="bold">
        Bold weight
      </Heading>
    </div>
  );
}
