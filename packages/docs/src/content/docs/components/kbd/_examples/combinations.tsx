import { Kbd } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span>
        <Kbd>⌘</Kbd> + <Kbd>K</Kbd>
      </span>
      <span>
        <Kbd>⌘</Kbd> + <Kbd>⇧</Kbd> + <Kbd>P</Kbd>
      </span>
      <span>
        <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>Del</Kbd>
      </span>
    </div>
  );
}
