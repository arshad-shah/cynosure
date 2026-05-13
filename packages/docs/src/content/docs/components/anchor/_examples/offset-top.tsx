import { Anchor } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Anchor id="anchor-offset-px" offsetTop={80} level={2}>
        Offset by 80 pixels
      </Anchor>
      <Anchor id="anchor-offset-rem" offsetTop="4rem" level={3}>
        Offset by 4rem (matches a sticky header)
      </Anchor>
    </div>
  );
}
