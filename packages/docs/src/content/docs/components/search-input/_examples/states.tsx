import { SearchInput } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '320px' }}>
      <SearchInput aria-label="Default" placeholder="Search…" />
      <SearchInput aria-label="With value" defaultValue="cynosure" />
      <SearchInput aria-label="Invalid" defaultValue="bad query" invalid />
      <SearchInput aria-label="Disabled" defaultValue="locked" disabled />
    </div>
  );
}
