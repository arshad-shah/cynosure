import { Fieldset, Input, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Fieldset legend="Shipping address">
      <Stack gap="3" style={{ width: 360 }}>
        <Input placeholder="Street" aria-label="Street" />
        <Input placeholder="City" aria-label="City" />
        <Input placeholder="Postal code" aria-label="Postal code" />
      </Stack>
    </Fieldset>
  );
}
