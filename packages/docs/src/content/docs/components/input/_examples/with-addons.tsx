import { Input } from '@arshad-shah/cynosure-react';

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '360px' }}>
      <Input leadingSlot={<SearchIcon />} placeholder="Search…" />
      <Input leadingSlot="https://" trailingSlot=".com" placeholder="example" />
      <Input leadingSlot="$" trailingSlot="USD" placeholder="0.00" />
    </div>
  );
}
