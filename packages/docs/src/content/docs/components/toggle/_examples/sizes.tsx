import { Toggle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Toggle size="xs" aria-label="Extra small">
        XS
      </Toggle>
      <Toggle size="sm" aria-label="Small">
        SM
      </Toggle>
      <Toggle size="md" aria-label="Medium">
        MD
      </Toggle>
      <Toggle size="lg" aria-label="Large">
        LG
      </Toggle>
    </div>
  );
}
