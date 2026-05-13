import { SearchInput } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [query, setQuery] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '320px' }}>
      <SearchInput
        aria-label="Search (debounced)"
        debounceMs={300}
        onSearch={setQuery}
        placeholder="Type to search…"
      />
      <span style={{ fontSize: '0.875rem', color: 'var(--c-fg-muted)' }}>
        Debounced query: {query || '(empty)'}
      </span>
    </div>
  );
}
