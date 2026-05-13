import { Skeleton } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: 240 }}>
      <Skeleton width={240} height={12} />
      <Skeleton width={200} height={12} />
      <Skeleton width={160} height={12} />
    </div>
  );
}
