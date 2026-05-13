import { Chip } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [tags, setTags] = useState(['Design', 'Engineering', 'Research']);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      {tags.map((tag) => (
        <Chip
          key={tag}
          colorScheme="neutral"
          onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
        >
          {tag}
        </Chip>
      ))}
    </div>
  );
}
