import { Checkbox, CheckboxGroup, Stack } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState<string[]>(['en']);
  return (
    <Stack gap="3">
      <CheckboxGroup value={value} onChange={setValue} aria-label="Languages">
        <Stack gap="2">
          <Checkbox value="en">English</Checkbox>
          <Checkbox value="fr">French</Checkbox>
          <Checkbox value="de">German</Checkbox>
        </Stack>
      </CheckboxGroup>
      <p style={{ fontSize: '0.875rem' }}>
        Selected: <code>{JSON.stringify(value)}</code>
      </p>
    </Stack>
  );
}
