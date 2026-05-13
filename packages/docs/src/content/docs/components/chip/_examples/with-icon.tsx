import { Chip } from '@arshad-shah/cynosure-react';

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Chip leftIcon={<CheckIcon />} colorScheme="success" selected>
        Verified
      </Chip>
      <Chip leftIcon={<CheckIcon />} colorScheme="accent">
        Beta
      </Chip>
    </div>
  );
}
