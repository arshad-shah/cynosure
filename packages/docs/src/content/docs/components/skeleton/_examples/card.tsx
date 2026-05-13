import { Skeleton } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div
      style={{
        width: 280,
        padding: '1rem',
        border: '1px solid var(--cynosure-color-border)',
        borderRadius: 'var(--cynosure-radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <Skeleton variant="rect" width="100%" aspectRatio="16 / 9" />
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Skeleton variant="circle" width={32} height={32} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
          <Skeleton width="60%" height={10} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
      <Skeleton width="100%" height={12} />
      <Skeleton width="80%" height={12} />
    </div>
  );
}
