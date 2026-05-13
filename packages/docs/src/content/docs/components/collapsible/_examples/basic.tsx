import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ maxWidth: '24rem' }}>
      <Collapsible>
        <CollapsibleTrigger>Show more</CollapsibleTrigger>
        <CollapsibleContent>
          <p style={{ marginTop: '0.5rem' }}>
            Collapsible regions are useful for progressive disclosure — keep the default view tight
            and let users reveal extra detail on demand.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
