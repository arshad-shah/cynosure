import { IconButton, Inline } from '@arshad-shah/cynosure-react';

const Plus = () => (
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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function Example() {
  return (
    <Inline gap="3">
      <IconButton label="Add" icon={<Plus />} disabled />
      <IconButton label="Add" icon={<Plus />} variant="soft" disabled />
      <IconButton label="Add" icon={<Plus />} variant="outline" disabled />
    </Inline>
  );
}
