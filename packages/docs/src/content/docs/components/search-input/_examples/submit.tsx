import { SearchInput } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '320px' }}>
      <SearchInput
        aria-label="Search"
        onSubmit={setSubmitted}
        placeholder="Press Enter to submit"
      />
      <span style={{ fontSize: '0.875rem', color: 'var(--c-fg-muted)' }}>
        Last submitted: {submitted ?? '(none)'}
      </span>
    </div>
  );
}
