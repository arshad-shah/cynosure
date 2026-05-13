import { MultiSelect } from '@arshad-shah/cynosure-react';

const items = [
  { value: 'a', label: 'Apples' },
  { value: 'b', label: 'Bananas' },
  { value: 'c', label: 'Cherries' },
  { value: 'd', label: 'Dragonfruit' },
  { value: 'e', label: 'Elderberries' },
];

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <MultiSelect
        aria-label="Pick up to 2 fruits"
        items={items}
        maxSelected={2}
        placeholder="Pick up to 2"
      />
    </div>
  );
}
