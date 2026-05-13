import { Anchor } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Anchor
        id="anchor-on-copy"
        level={2}
        onCopy={() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        Click the link icon
      </Anchor>
      <span style={{ fontSize: '0.875rem', color: 'var(--cynosure-color-fg-muted)' }}>
        {copied ? 'URL copied to clipboard.' : 'Hover the heading to reveal the link.'}
      </span>
    </div>
  );
}
