import { Select } from '@arshad-shah/cynosure-react';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

export default function Example() {
  return (
    <div style={{ width: '240px' }}>
      <Select aria-label="Disabled select" items={options} defaultValue="a" disabled />
    </div>
  );
}
