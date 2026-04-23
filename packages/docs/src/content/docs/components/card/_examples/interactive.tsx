import { Card, CardBody, CardDescription, CardTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card
        interactive
        style={{ maxWidth: '18rem', cursor: 'pointer' }}
        onClick={() => alert('Card clicked')}
      >
        <CardBody>
          <CardTitle>Interactive card</CardTitle>
          <CardDescription>
            This card is focusable and responds to click, hover, and keyboard events.
          </CardDescription>
        </CardBody>
      </Card>
      <Card interactive asChild style={{ maxWidth: '18rem' }}>
        <a href="/components/card">
          <CardBody>
            <CardTitle>Link card</CardTitle>
            <CardDescription>Uses asChild to render the card as an anchor element.</CardDescription>
          </CardBody>
        </a>
      </Card>
    </div>
  );
}
