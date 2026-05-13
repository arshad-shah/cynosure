import { Code } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Code colorScheme="neutral">neutral</Code>
      <Code colorScheme="accent">accent</Code>
      <Code colorScheme="success">success</Code>
      <Code colorScheme="danger">danger</Code>
    </div>
  );
}
