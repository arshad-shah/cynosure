import {
  Button,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Popover>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <PopoverAnchor asChild>
          <div
            style={{
              padding: '0.75rem 1rem',
              border: '1px dashed var(--cynosure-color-border-default, #d4d4d4)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            Visual anchor (the panel points here)
          </div>
        </PopoverAnchor>
        <PopoverTrigger asChild>
          <Button variant="outline">Toggle from far away</Button>
        </PopoverTrigger>
      </div>
      <PopoverContent side="top">
        <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', maxWidth: '16rem' }}>
          The trigger and the anchor are different elements — the panel positions itself next to the
          anchor.
        </div>
      </PopoverContent>
    </Popover>
  );
}
