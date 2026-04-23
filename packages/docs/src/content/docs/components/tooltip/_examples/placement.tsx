import { Button, Tooltip, TooltipProvider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <TooltipProvider>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <Tooltip content="Tooltip on top" side="top">
          <Button variant="outline">Top</Button>
        </Tooltip>
        <Tooltip content="Tooltip on right" side="right">
          <Button variant="outline">Right</Button>
        </Tooltip>
        <Tooltip content="Tooltip on bottom" side="bottom">
          <Button variant="outline">Bottom</Button>
        </Tooltip>
        <Tooltip content="Tooltip on left" side="left">
          <Button variant="outline">Left</Button>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
