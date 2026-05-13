import { Code } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      <Code size="sm">size="sm"</Code>
      <Code size="md">size="md"</Code>
    </div>
  );
}
