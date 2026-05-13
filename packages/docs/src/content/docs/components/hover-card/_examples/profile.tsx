import {
  Avatar,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Link,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '32rem' }}>
      Pull request reviewed by{' '}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link href="#">@alex</Link>
        </HoverCardTrigger>
        <HoverCardContent>
          <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '18rem' }}>
            <Avatar name="Alex Park" />
            <div style={{ display: 'grid', gap: '0.125rem' }}>
              <strong>Alex Park</strong>
              <span
                style={{ color: 'var(--cynosure-color-foreground-muted)', fontSize: '0.8125rem' }}
              >
                @alex · Engineering
              </span>
              <span style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                Working on the design system. Reviews every Tuesday and Thursday.
              </span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{' '}
      and approved this morning.
    </p>
  );
}
