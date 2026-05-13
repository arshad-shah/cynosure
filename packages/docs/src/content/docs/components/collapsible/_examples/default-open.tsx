import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ maxWidth: '24rem' }}>
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Release notes</CollapsibleTrigger>
        <CollapsibleContent>
          <p style={{ marginTop: '0.5rem' }}>
            Version 0.2.0 ships the new Calendar primitive, an overhauled colour picker, and tighter
            focus rings across every interactive surface.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
