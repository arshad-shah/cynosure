import { Select } from '@arshad-shah/cynosure-react';

const items = [
  { value: 'apple', label: 'Apple', section: 'Fruits' },
  { value: 'banana', label: 'Banana', section: 'Fruits' },
  { value: 'cherry', label: 'Cherry', section: 'Fruits' },
  { value: 'broccoli', label: 'Broccoli', section: 'Vegetables' },
  { value: 'carrot', label: 'Carrot', section: 'Vegetables' },
  { value: 'spinach', label: 'Spinach', section: 'Vegetables' },
];

export default function Example() {
  return (
    <div style={{ width: '240px' }}>
      <Select aria-label="Food item" items={items} placeholder="Choose a food…" />
    </div>
  );
}
