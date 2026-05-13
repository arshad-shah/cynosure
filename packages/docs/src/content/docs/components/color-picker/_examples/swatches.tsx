import { ColorPicker } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [swatches, setSwatches] = useState<string[]>([
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#0ea5e9',
    '#6366f1',
    '#ec4899',
  ]);
  return (
    <div style={{ width: 340 }}>
      <ColorPicker
        variant="inline"
        defaultValue="#ef4444"
        swatches={swatches}
        onSwatchesChange={setSwatches}
        maxSwatches={12}
      />
    </div>
  );
}
