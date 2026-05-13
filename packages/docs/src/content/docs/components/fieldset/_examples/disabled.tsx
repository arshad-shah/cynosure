import { Checkbox, Fieldset, Input, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Fieldset legend="Billing (read only)" disabled>
      <Stack gap="3" style={{ width: 360 }}>
        <Input defaultValue="Ada Lovelace" aria-label="Name" />
        <Input defaultValue="ada@example.com" type="email" aria-label="Email" />
        <Checkbox defaultChecked>Send me invoices</Checkbox>
      </Stack>
    </Fieldset>
  );
}
