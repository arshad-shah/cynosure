import { SearchInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '320px' }}>
      <SearchInput aria-label="Small" size="sm" placeholder="Search…" />
      <SearchInput aria-label="Medium" size="md" placeholder="Search…" />
      <SearchInput aria-label="Large" size="lg" placeholder="Search…" />
    </div>
  );
}
