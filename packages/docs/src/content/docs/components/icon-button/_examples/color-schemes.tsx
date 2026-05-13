import { IconButton, Inline, Stack } from '@arshad-shah/cynosure-react';

const Trash = () => (
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function Example() {
  return (
    <Stack gap="3">
      <Inline gap="3">
        <IconButton label="Delete" icon={<Trash />} colorScheme="accent" />
        <IconButton label="Delete" icon={<Trash />} colorScheme="neutral" />
        <IconButton label="Delete" icon={<Trash />} colorScheme="success" />
        <IconButton label="Delete" icon={<Trash />} colorScheme="warning" />
        <IconButton label="Delete" icon={<Trash />} colorScheme="danger" />
      </Inline>
      <Inline gap="3">
        <IconButton label="Delete" icon={<Trash />} variant="soft" colorScheme="accent" />
        <IconButton label="Delete" icon={<Trash />} variant="soft" colorScheme="neutral" />
        <IconButton label="Delete" icon={<Trash />} variant="soft" colorScheme="success" />
        <IconButton label="Delete" icon={<Trash />} variant="soft" colorScheme="warning" />
        <IconButton label="Delete" icon={<Trash />} variant="soft" colorScheme="danger" />
      </Inline>
    </Stack>
  );
}
