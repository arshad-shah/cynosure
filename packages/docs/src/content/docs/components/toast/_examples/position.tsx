import { Button, Toaster, type ToasterPosition, toast } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

const positions: ToasterPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export default function Example() {
  const [position, setPosition] = useState<ToasterPosition>('bottom-right');
  return (
    <>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {positions.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={value === position ? 'solid' : 'outline'}
              onClick={() => setPosition(value)}
            >
              {value}
            </Button>
          ))}
        </div>
        <div>
          <Button onClick={() => toast(`Shown at ${position}`)}>Show toast</Button>
        </div>
      </div>
      <Toaster position={position} />
    </>
  );
}
