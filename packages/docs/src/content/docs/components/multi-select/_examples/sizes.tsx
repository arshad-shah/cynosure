import { MultiSelect } from '@arshad-shah/cynosure-react';

const items = [
  { value: 'ie', label: 'Ireland' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
];

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '320px' }}>
      <MultiSelect aria-label="Small" size="sm" items={items} defaultValue={['ie']} />
      <MultiSelect aria-label="Medium" size="md" items={items} defaultValue={['ie', 'uk']} />
      <MultiSelect aria-label="Large" size="lg" items={items} defaultValue={['ie', 'uk', 'fr']} />
    </div>
  );
}
