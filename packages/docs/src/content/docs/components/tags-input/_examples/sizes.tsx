import { TagsInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '360px' }}>
      <TagsInput aria-label="Small" size="sm" defaultValue={['alpha', 'beta']} />
      <TagsInput aria-label="Medium" size="md" defaultValue={['alpha', 'beta']} />
      <TagsInput aria-label="Large" size="lg" defaultValue={['alpha', 'beta']} />
    </div>
  );
}
