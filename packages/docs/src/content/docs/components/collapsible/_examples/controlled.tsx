import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ maxWidth: '24rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Open
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger>Toggle inline</CollapsibleTrigger>
        <CollapsibleContent>
          <p style={{ marginTop: '0.5rem' }}>
            The buttons above and the trigger below share the same state.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
