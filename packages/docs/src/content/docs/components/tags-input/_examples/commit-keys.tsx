import { TagsInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '360px' }}>
      <TagsInput
        aria-label="Tags (Space or Enter to commit)"
        commitKeys={['Enter', ' ']}
        placeholder="Type and press Space"
      />
    </div>
  );
}
