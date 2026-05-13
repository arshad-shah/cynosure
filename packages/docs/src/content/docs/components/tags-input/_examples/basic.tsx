import { TagsInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '360px' }}>
      <TagsInput aria-label="Topics" defaultValue={['design', 'systems']} placeholder="Add tag…" />
    </div>
  );
}
