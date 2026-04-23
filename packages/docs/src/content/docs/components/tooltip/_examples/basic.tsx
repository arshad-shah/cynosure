import { Button, Tooltip, TooltipProvider } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <TooltipProvider>
      <Tooltip content="Save your changes">
        <Button>Save</Button>
      </Tooltip>
    </TooltipProvider>
  );
}
