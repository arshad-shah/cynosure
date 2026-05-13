import { Toggle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Toggle variant="ghost" aria-label="Toggle ghost">
        Ghost
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle outline">
        Outline
      </Toggle>
      <Toggle variant="solid" aria-label="Toggle solid">
        Solid
      </Toggle>
    </div>
  );
}
