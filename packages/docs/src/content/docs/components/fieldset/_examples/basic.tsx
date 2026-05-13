import { Fieldset, Input, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Fieldset legend="Contact details">
      <Stack gap="3" style={{ width: 320 }}>
        <Input placeholder="Full name" aria-label="Full name" />
        <Input type="email" placeholder="Email" aria-label="Email" />
      </Stack>
    </Fieldset>
  );
}
