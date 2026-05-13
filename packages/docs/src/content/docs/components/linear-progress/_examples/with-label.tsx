import { LinearProgress } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '22rem' }}>
      <LinearProgress
        value={64}
        label="Uploading project assets"
        meta="2.4 MB / 3.8 MB"
        showValue
      />
    </div>
  );
}
