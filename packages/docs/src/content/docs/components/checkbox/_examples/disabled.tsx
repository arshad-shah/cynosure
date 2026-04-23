import { Checkbox } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Checkbox disabled>Disabled unchecked</Checkbox>
      <Checkbox disabled checked>
        Disabled checked
      </Checkbox>
    </div>
  );
}
