import { Tag } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [active, setActive] = useState('design');
  const filters = ['design', 'engineering', 'research'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      {filters.map((filter) => (
        <Tag
          key={filter}
          colorScheme={active === filter ? 'accent' : 'neutral'}
          variant={active === filter ? 'solid' : 'soft'}
          onClick={() => setActive(filter)}
        >
          {filter}
        </Tag>
      ))}
    </div>
  );
}
