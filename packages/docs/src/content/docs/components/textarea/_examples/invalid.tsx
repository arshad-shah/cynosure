import { Textarea } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '400px' }}>
      <Textarea invalid defaultValue="This field has an error." rows={3} />
      <p style={{ fontSize: '0.875rem', color: 'var(--color-danger-600, #dc2626)', margin: 0 }}>
        This field is required.
      </p>
    </div>
  );
}
