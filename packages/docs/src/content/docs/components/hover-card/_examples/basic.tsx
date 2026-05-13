import { HoverCard, HoverCardContent, HoverCardTrigger, Link } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href="#">@jane</Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <strong>Jane Doe</strong>
          <span>Design engineer building component systems.</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
