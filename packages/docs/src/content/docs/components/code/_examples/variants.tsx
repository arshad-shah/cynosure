import { Code } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Code variant="inline">npm install @arshad-shah/cynosure-react</Code>
      <Code variant="block">{`function greet(name) {
  return \`Hello, \${name}!\`;
}`}</Code>
    </div>
  );
}
