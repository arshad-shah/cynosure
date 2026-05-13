import { LinearProgress } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '20rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <LinearProgress value={60} colorScheme="accent" />
      <LinearProgress value={60} colorScheme="success" />
      <LinearProgress value={60} colorScheme="warning" />
      <LinearProgress value={60} colorScheme="danger" />
      <LinearProgress value={60} colorScheme="neutral" />
    </div>
  );
}
