import { LinearProgress } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '22rem' }}>
      <LinearProgress value={32} buffer={68} label="Streaming" meta="1:48 / 5:32" />
    </div>
  );
}
