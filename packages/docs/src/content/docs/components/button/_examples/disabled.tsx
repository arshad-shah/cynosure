import { Button } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Button disabled>Disabled</Button>
      <Button disabled variant="outline">
        Disabled outline
      </Button>
      <Button disabled variant="ghost">
        Disabled ghost
      </Button>
    </div>
  );
}
