import { Tag } from '@arshad-shah/cynosure-react';

const HashIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Tag icon={<HashIcon />} colorScheme="accent">
        design-system
      </Tag>
      <Tag icon={<HashIcon />} colorScheme="success">
        released
      </Tag>
      <Tag icon={<HashIcon />} colorScheme="warning">
        in-review
      </Tag>
    </div>
  );
}
