import {
  Button,
  EmptyState,
  EmptyStateActions,
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
          <path d="M3 7h18" />
          <path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
          <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
        </svg>
      </EmptyStateIcon>
      <EmptyStateTitle>Your inbox is empty</EmptyStateTitle>
      <EmptyStateDescription>
        New messages will appear here. Invite a teammate to start a conversation.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button>Invite teammate</Button>
        <Button variant="ghost">Learn more</Button>
      </EmptyStateActions>
    </EmptyState>
  );
}
