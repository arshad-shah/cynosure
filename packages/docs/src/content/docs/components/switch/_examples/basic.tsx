import { Switch } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [enabled, setEnabled] = useState(false);
  return (
    <Switch checked={enabled} onCheckedChange={setEnabled}>
      {enabled ? 'Enabled' : 'Disabled'}
    </Switch>
  );
}
