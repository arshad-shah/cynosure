import { Notification } from '@arshad-shah/cynosure-react';

const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export default function Example() {
  return (
    <Notification
      icon={<BellIcon />}
      title="New comment"
      description="Grace Hopper left a comment on your pull request."
      timestamp="2m ago"
    />
  );
}
