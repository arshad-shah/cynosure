import { HoverCard, HoverCardContent, HoverCardTrigger, Link } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCardTrigger asChild>
          <Link href="#">Instant</Link>
        </HoverCardTrigger>
        <HoverCardContent>
          <div>openDelay=0 / closeDelay=0</div>
        </HoverCardContent>
      </HoverCard>
      <HoverCard openDelay={300} closeDelay={150}>
        <HoverCardTrigger asChild>
          <Link href="#">Quick</Link>
        </HoverCardTrigger>
        <HoverCardContent>
          <div>openDelay=300 / closeDelay=150</div>
        </HoverCardContent>
      </HoverCard>
      <HoverCard openDelay={1000} closeDelay={600}>
        <HoverCardTrigger asChild>
          <Link href="#">Patient</Link>
        </HoverCardTrigger>
        <HoverCardContent>
          <div>openDelay=1000 / closeDelay=600</div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
