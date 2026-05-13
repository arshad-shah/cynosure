import { Button, Popover, PopoverContent, PopoverTrigger } from '@arshad-shah/cynosure-react';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export default function Example() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, auto)',
        gap: '0.75rem',
        justifyContent: 'start',
      }}
    >
      {sides.map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side}>
            <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>side="{side}"</div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
