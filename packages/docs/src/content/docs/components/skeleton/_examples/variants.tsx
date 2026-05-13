import { Skeleton } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
      <Skeleton variant="circle" width={48} height={48} />
      <Skeleton variant="rect" width={120} height={72} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton variant="text" width={200} height={12} />
        <Skeleton variant="text" width={160} height={12} />
      </div>
    </div>
  );
}
