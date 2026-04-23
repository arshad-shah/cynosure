import { Combobox, ComboboxEmpty } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

const ALL_ITEMS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
];

export default function Example() {
  const [inputValue, setInputValue] = useState('');

  const filtered = ALL_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div style={{ width: '260px' }}>
      <Combobox
        aria-label="Framework"
        items={filtered}
        inputValue={inputValue}
        onInputChange={setInputValue}
        placeholder="Type to filter…"
        emptyState={<ComboboxEmpty>No frameworks match "{inputValue}"</ComboboxEmpty>}
      />
    </div>
  );
}
