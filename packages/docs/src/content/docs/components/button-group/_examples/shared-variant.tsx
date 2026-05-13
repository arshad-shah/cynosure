import { Button, ButtonGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <ButtonGroup variant="soft" colorScheme="accent" aria-label="Message actions">
        <Button>Reply</Button>
        <Button>Forward</Button>
        <Button>Archive</Button>
      </ButtonGroup>
      <ButtonGroup variant="outline" size="sm" aria-label="Small toolbar">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <ButtonGroup variant="ghost" size="lg" aria-label="Large toolbar">
        <Button>Save</Button>
        <Button>Discard</Button>
      </ButtonGroup>
    </div>
  );
}
