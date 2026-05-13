import { TagsInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: '360px' }}>
      <TagsInput
        aria-label="Languages"
        suggestions={['TypeScript', 'Rust', 'Go', 'Python', 'Elixir']}
        placeholder="Type to see suggestions"
      />
    </div>
  );
}
