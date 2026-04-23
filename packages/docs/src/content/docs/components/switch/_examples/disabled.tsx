import { Switch } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Switch disabled>Disabled (off)</Switch>
      <Switch disabled defaultChecked>
        Disabled (on)
      </Switch>
    </div>
  );
}
