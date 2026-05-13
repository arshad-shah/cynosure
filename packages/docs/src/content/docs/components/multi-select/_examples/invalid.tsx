import { MultiSelect } from '@arshad-shah/cynosure-react';

const items = [
  { value: 'owner', label: 'Owner' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

export default function Example() {
  return (
    <div style={{ width: '320px' }}>
      <MultiSelect
        aria-label="Roles"
        items={items}
        invalid
        required
        placeholder="Pick at least one"
      />
    </div>
  );
}
