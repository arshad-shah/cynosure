import { Switch } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Switch size="sm" defaultChecked>
        Small
      </Switch>
      <Switch size="md" defaultChecked>
        Medium (default)
      </Switch>
      <Switch size="lg" defaultChecked>
        Large
      </Switch>
    </div>
  );
}
