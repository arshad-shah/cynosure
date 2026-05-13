import { EmptyState, EmptyStateDescription, EmptyStateTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <EmptyState size="sm">
        <EmptyStateTitle>Inline empty (sm)</EmptyStateTitle>
        <EmptyStateDescription>Compact size for narrow panels.</EmptyStateDescription>
      </EmptyState>
      <EmptyState size="md">
        <EmptyStateTitle>Default empty (md)</EmptyStateTitle>
        <EmptyStateDescription>Use this size inside most page layouts.</EmptyStateDescription>
      </EmptyState>
      <EmptyState size="lg">
        <EmptyStateTitle>Large empty (lg)</EmptyStateTitle>
        <EmptyStateDescription>Bigger headline for prominent regions.</EmptyStateDescription>
      </EmptyState>
    </div>
  );
}
