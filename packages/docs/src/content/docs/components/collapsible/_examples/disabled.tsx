import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ maxWidth: '24rem' }}>
      <Collapsible disabled>
        <CollapsibleTrigger>Locked panel</CollapsibleTrigger>
        <CollapsibleContent>
          <p style={{ marginTop: '0.5rem' }}>
            This content stays hidden — the trigger is disabled.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
