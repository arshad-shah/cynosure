import { Toggle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Toggle variant="outline" disabled aria-label="Disabled off">
        Off
      </Toggle>
      <Toggle variant="outline" disabled defaultPressed aria-label="Disabled on">
        On
      </Toggle>
    </div>
  );
}
