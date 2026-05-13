import { Callout, CalloutContent, CalloutTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Callout variant="outline" colorScheme="accent">
        <CalloutTitle>Outline accent</CalloutTitle>
        <CalloutContent>A lighter, border-only treatment for dense layouts.</CalloutContent>
      </Callout>
      <Callout variant="outline" colorScheme="success">
        <CalloutTitle>Outline success</CalloutTitle>
        <CalloutContent>
          Pair with a textual title so meaning never relies on colour alone.
        </CalloutContent>
      </Callout>
    </div>
  );
}
