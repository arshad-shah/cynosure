import { Skeleton } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 240 }}>
      <div>
        <p
          style={{
            margin: '0 0 0.25rem',
            fontSize: '0.75rem',
            color: 'var(--cynosure-color-fg-muted)',
          }}
        >
          pulse
        </p>
        <Skeleton width={240} height={12} animation="pulse" />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 0.25rem',
            fontSize: '0.75rem',
            color: 'var(--cynosure-color-fg-muted)',
          }}
        >
          wave
        </p>
        <Skeleton width={240} height={12} animation="wave" />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 0.25rem',
            fontSize: '0.75rem',
            color: 'var(--cynosure-color-fg-muted)',
          }}
        >
          none
        </p>
        <Skeleton width={240} height={12} animation="none" />
      </div>
    </div>
  );
}
