import { Anchor } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Anchor id="anchor-h1" level={1}>
        Heading 1
      </Anchor>
      <Anchor id="anchor-h2" level={2}>
        Heading 2
      </Anchor>
      <Anchor id="anchor-h3" level={3}>
        Heading 3
      </Anchor>
      <Anchor id="anchor-h4" level={4}>
        Heading 4
      </Anchor>
    </div>
  );
}
