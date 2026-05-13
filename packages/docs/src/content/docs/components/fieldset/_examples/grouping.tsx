import { Checkbox, CheckboxGroup, Fieldset, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Fieldset legend="Notifications">
      <CheckboxGroup defaultValue={['email']}>
        <Stack gap="2">
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
          <Checkbox value="push">Push</Checkbox>
        </Stack>
      </CheckboxGroup>
    </Fieldset>
  );
}
