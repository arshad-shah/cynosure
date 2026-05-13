import { BackToTop } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--cynosure-color-fg-muted)' }}>
        Rendered inline (no portal):
      </span>
      <BackToTop disablePortal showAfter={0} />
    </div>
  );
}
