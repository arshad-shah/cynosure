import { IconButton, Inline } from '@arshad-shah/cynosure-react';

const Search = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Example() {
  return (
    <Inline gap="3" align="center">
      <IconButton label="Search" icon={<Search />} shape="square" />
      <IconButton label="Search" icon={<Search />} shape="pill" />
    </Inline>
  );
}
