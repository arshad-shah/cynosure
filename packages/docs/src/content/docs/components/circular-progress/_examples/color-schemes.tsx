import { CircularProgress } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
      <CircularProgress value={70} colorScheme="accent" />
      <CircularProgress value={70} colorScheme="success" />
      <CircularProgress value={70} colorScheme="warning" />
      <CircularProgress value={70} colorScheme="danger" />
      <CircularProgress value={70} colorScheme="neutral" />
    </div>
  );
}
