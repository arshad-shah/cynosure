import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
        </svg>
      </EmptyStateIcon>
      <EmptyStateTitle>No items yet</EmptyStateTitle>
      <EmptyStateDescription>Create your first item to get started.</EmptyStateDescription>
    </EmptyState>
  );
}
