import { Button, Popover, PopoverContent, PopoverTrigger } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ display: 'grid', gap: '0.25rem', maxWidth: '16rem' }}>
          <strong>Quick note</strong>
          <span>Popovers are great for small bits of contextual content close to the trigger.</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
