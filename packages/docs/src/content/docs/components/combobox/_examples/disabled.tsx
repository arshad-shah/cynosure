import { Combobox } from '@arshad-shah/cynosure-react';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

export default function Example() {
  return (
    <div style={{ width: '260px' }}>
      <Combobox
        aria-label="Disabled combobox"
        items={options}
        defaultValue="a"
        disabled
        placeholder="Disabled…"
      />
    </div>
  );
}
