import { Callout, CalloutContent, CalloutTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Callout colorScheme="accent">
        <CalloutTitle>Accent</CalloutTitle>
        <CalloutContent>Use the accent tone to highlight a primary tip.</CalloutContent>
      </Callout>
      <Callout colorScheme="neutral">
        <CalloutTitle>Neutral</CalloutTitle>
        <CalloutContent>Use neutral for quiet asides and footnotes.</CalloutContent>
      </Callout>
      <Callout colorScheme="success">
        <CalloutTitle>Success</CalloutTitle>
        <CalloutContent>
          Confirms a positive outcome inline with the surrounding content.
        </CalloutContent>
      </Callout>
      <Callout colorScheme="warning">
        <CalloutTitle>Warning</CalloutTitle>
        <CalloutContent>Signals caution without escalating to an alert.</CalloutContent>
      </Callout>
      <Callout colorScheme="danger">
        <CalloutTitle>Danger</CalloutTitle>
        <CalloutContent>
          Flags risk in supporting context. Use Alert for interruptive errors.
        </CalloutContent>
      </Callout>
    </div>
  );
}
