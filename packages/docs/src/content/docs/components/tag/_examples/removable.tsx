import { Tag } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [tags, setTags] = useState(['design', 'engineering', 'research']);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      {tags.map((tag) => (
        <Tag
          key={tag}
          colorScheme="accent"
          onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
        >
          {tag}
        </Tag>
      ))}
    </div>
  );
}
