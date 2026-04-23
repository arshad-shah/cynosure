import { Combobox } from '@arshad-shah/cynosure-react';

const colors = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'yellow', label: 'Yellow' },
];

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '260px' }}>
      <Combobox
        aria-label="Colour (or type your own)"
        items={colors}
        allowsCustomValue
        placeholder="Pick or type a colour…"
      />
      <p style={{ fontSize: '0.75rem', color: 'var(--color-fg-muted, #6b7280)', margin: 0 }}>
        Custom values allowed — type anything and press Enter.
      </p>
    </div>
  );
}
