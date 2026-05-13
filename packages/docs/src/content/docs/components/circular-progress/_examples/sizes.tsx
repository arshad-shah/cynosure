import { CircularProgress } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
      <CircularProgress value={60} size="xs" />
      <CircularProgress value={60} size="sm" />
      <CircularProgress value={60} size="md" />
      <CircularProgress value={60} size="lg" />
      <CircularProgress value={60} size="xl" />
    </div>
  );
}
