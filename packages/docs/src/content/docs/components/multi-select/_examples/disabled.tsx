import { MultiSelect } from '@arshad-shah/cynosure-react';

const items = [
  { value: 'r', label: 'Red' },
  { value: 'g', label: 'Green' },
  { value: 'b', label: 'Blue' },
];

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <MultiSelect aria-label="Colors" items={items} defaultValue={['r', 'b']} disabled />
    </div>
  );
}
