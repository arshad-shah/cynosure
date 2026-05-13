import { Toggle } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [bold, setBold] = useState(false);
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Toggle variant="outline" pressed={bold} onPressedChange={setBold} aria-label="Toggle bold">
        Bold
      </Toggle>
      <span>{bold ? 'On' : 'Off'}</span>
    </div>
  );
}
