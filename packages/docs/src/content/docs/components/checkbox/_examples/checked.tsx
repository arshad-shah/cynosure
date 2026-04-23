import { Checkbox } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [checked, setChecked] = useState(true);
  return (
    <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)}>
      Subscribe to newsletter
    </Checkbox>
  );
}
