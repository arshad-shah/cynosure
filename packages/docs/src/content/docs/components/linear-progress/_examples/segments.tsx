import { LinearProgress } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '22rem' }}>
      <LinearProgress
        max={100}
        label="Storage"
        meta="78 GB of 100 GB"
        segments={[
          { value: 48, colorScheme: 'accent', label: 'Photos' },
          { value: 20, colorScheme: 'success', label: 'Documents' },
          { value: 10, colorScheme: 'warning', label: 'Other' },
        ]}
      />
    </div>
  );
}
