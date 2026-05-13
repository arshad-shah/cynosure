import {
  Button,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Show details</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ display: 'grid', gap: '0.25rem', maxWidth: '16rem' }}>
          <strong>Pointed at the trigger</strong>
          <span style={{ fontSize: '0.875rem' }}>
            PopoverArrow renders a directional pointer toward the trigger.
          </span>
        </div>
        <PopoverArrow />
      </PopoverContent>
    </Popover>
  );
}
