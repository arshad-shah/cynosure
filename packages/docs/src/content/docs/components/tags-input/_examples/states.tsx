import { TagsInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '360px' }}>
      <TagsInput aria-label="Default" defaultValue={['one', 'two']} />
      <TagsInput aria-label="Invalid" defaultValue={['one']} invalid />
      <TagsInput aria-label="Read-only" defaultValue={['locked', 'fixed']} readOnly />
      <TagsInput aria-label="Disabled" defaultValue={['disabled']} disabled />
    </div>
  );
}
