import { Button, Tooltip, TooltipProvider } from '@arshad-shah/cynosure-react';

function RichContent() {
  return (
    <div style={{ maxWidth: '16rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>Keyboard shortcut</p>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Press <kbd style={{ fontFamily: 'monospace' }}>⌘ S</kbd> to save at any time.
      </p>
    </div>
  );
}

export default function Example() {
  return (
    <TooltipProvider>
      <Tooltip content={<RichContent />} side="right" withArrow>
        <Button variant="outline">Hover for details</Button>
      </Tooltip>
    </TooltipProvider>
  );
}
