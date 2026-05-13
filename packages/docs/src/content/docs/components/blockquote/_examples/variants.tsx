import { Blockquote } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Blockquote variant="default" attribution="Grace Hopper">
        The most damaging phrase in the language is, "We've always done it this way."
      </Blockquote>
      <Blockquote variant="callout" attribution="Donald Knuth">
        Premature optimisation is the root of all evil.
      </Blockquote>
    </div>
  );
}
