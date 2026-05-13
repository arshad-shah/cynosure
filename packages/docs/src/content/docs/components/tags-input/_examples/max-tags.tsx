import { TagsInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '360px' }}>
      <TagsInput aria-label="Up to 3 tags" maxTags={3} placeholder="Add up to 3" />
    </div>
  );
}
