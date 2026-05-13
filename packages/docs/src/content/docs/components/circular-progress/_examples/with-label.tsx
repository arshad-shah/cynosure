import { CircularProgress } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <CircularProgress value={42} size="lg">
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>42%</span>
      </CircularProgress>
      <CircularProgress value={100} size="lg" colorScheme="success">
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Done</span>
      </CircularProgress>
    </div>
  );
}
