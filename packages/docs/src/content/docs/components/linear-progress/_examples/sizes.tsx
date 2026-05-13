import { LinearProgress } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '20rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <LinearProgress value={60} size="xs" />
      <LinearProgress value={60} size="sm" />
      <LinearProgress value={60} size="md" />
      <LinearProgress value={60} size="lg" />
    </div>
  );
}
