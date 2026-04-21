import { Button } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Button loading>Saving…</Button>
      <Button loading variant="outline">
        Loading
      </Button>
      <Button loading variant="soft" colorScheme="success">
        Processing
      </Button>
    </div>
  );
}
