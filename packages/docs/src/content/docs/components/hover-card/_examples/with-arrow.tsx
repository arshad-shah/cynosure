import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
  Link,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href="#">Cynosure docs</Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <div style={{ display: 'grid', gap: '0.25rem', maxWidth: '16rem' }}>
          <strong>Cynosure</strong>
          <span style={{ fontSize: '0.875rem' }}>
            A design system for React applications. Hover for a quick preview.
          </span>
        </div>
        <HoverCardArrow />
      </HoverCardContent>
    </HoverCard>
  );
}
