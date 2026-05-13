import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <EmptyState variant="subtle">
      <EmptyStateIcon>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16" y2="16" />
        </svg>
      </EmptyStateIcon>
      <EmptyStateTitle>No results</EmptyStateTitle>
      <EmptyStateDescription>Try a different keyword or clear your filters.</EmptyStateDescription>
    </EmptyState>
  );
}
