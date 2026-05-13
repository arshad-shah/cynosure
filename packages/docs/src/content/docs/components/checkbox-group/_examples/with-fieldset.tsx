import { Checkbox, CheckboxGroup, Fieldset, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Fieldset legend="Pick your languages">
      <CheckboxGroup defaultValue={['en']}>
        <Stack gap="2">
          <Checkbox value="en">English</Checkbox>
          <Checkbox value="fr">French</Checkbox>
          <Checkbox value="de">German</Checkbox>
          <Checkbox value="es">Spanish</Checkbox>
        </Stack>
      </CheckboxGroup>
    </Fieldset>
  );
}
