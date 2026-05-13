import { MultiSelect } from '@arshad-shah/cynosure-react';

const items = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
];

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <MultiSelect
        items={items}
        defaultValue={['react', 'svelte']}
        placeholder="Pick frameworks"
        aria-label="Frameworks"
      />
    </div>
  );
}
